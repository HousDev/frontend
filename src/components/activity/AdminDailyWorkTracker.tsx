import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Users,
  PlayCircle,
  Coffee,
  Clock,
  AlertTriangle,
  Zap,
  Search,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Edit,
  X,
  Target,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Mail,
  Eye,
  Trash2,
  Download,
  ArrowLeft,
  CalendarDays,
  Activity,
  BarChart3,
  MinusSquare,
  Timer,
  Sparkles,
  Table2,
  LineChart,
} from "lucide-react";
import { workSessionAPI } from "@/lib/api";
import AdminBreakTypesMasterModal from "./AdminBreakTypesMasterModal";

// ── Brand tokens ───────────────────────────────────────
const NAVY = "#0B3854";
const NAVY_SOFT = "#11507A";
const ORANGE = "#E6761D";
const LINE = "#dbe4ee";
const V_LINE = "#e8eef5";
const CARD_SHADOW = "0 1px 2px rgba(11,56,84,0.06), 0 4px 12px -6px rgba(11,56,84,0.10)";
const BRAND_GRADIENT = `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)`;

// Chart palette
const CHART_WORKED = "#11507A";
const CHART_PRODUCTIVE = "#059669";
const CHART_BREAK = "#E6761D";

// ── Table layout ──
const ROW_H = 52;
const HEAD_H = 38;
const SEARCH_H = 40;
const PAGE_SIZE_OPTIONS = [8, 10, 15, 25];

const STATUS_OPTIONS = [
  { value: "", label: "All status" },
  { value: "ACHIEVED", label: "Achieved" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "BEHIND", label: "Behind" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "PENDING", label: "Pending" },
];

// ── Break-type colours (same type = same colour everywhere) ──
const BREAK_PALETTE = ["#E6761D", "#11507A", "#059669", "#7c3aed", "#e11d48", "#0891b2", "#ca8a04", "#475569"];
const getBreakColor = (type?: string) => {
  const s = (type || "other").toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return BREAK_PALETTE[h % BREAK_PALETTE.length];
};

const BREAK_DETAIL_LABELS: Record<string, string> = {
  clientName: "Client",
  property: "Property",
  meetingNotes: "Notes",
  meetingPurpose: "Purpose",
  meetingWith: "With",
  meetingType: "Type",
  priority: "Priority",
  duration: "Duration",
  customDuration: "Duration",
};

const getPageNumbers = (total: number, current: number): (number | "...")[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
};

// ── Helper: Extract Initials (First + Last Name) ──
const getInitials = (name: string): string => {
  if (!name) return "E";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
};

// ── Helper: Format seconds to HH:MM:SS ──
const formatSeconds = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds || 0));
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const remaining = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${remaining}`;
};

// ── Helper: Format seconds to "2h 23m" (easy to read) ──
const formatHM = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

// ── Helper: Format seconds to compact "2h 23m" / "23m" ──
const formatCompact = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

// ── Helper: "HH:MM:SS" (or "HH:MM") → seconds ──
const parseDuration = (value?: string | null): number => {
  if (!value) return 0;
  const parts = String(value).trim().split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60;
  return 0;
};

const normType = (t?: string) => {
  const s = (t || "Other").trim() || "Other";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Local date → YYYY-MM-DD (no UTC shift) */
const dateToKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** YYYY-MM-DD → local Date */
const keyToDate = (key: string): Date => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const formatShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

const getISOWeek = (d: Date): number => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

type PresetId = "today" | "week" | "month" | "lastMonth";

const getPresetRange = (id: PresetId): { from: string; to: string } => {
  const now = new Date();
  const today = dateToKey(now);
  if (id === "today") return { from: today, to: today };
  if (id === "week") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    return { from: dateToKey(start), to: today };
  }
  if (id === "month") {
    return { from: dateToKey(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
  }
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return { from: dateToKey(start), to: dateToKey(end) };
};

/** Format a date-like value to DD-MM-YYYY */
const formatDateDDMMYYYY = (value?: string | null): string => {
  if (!value) return "—";
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}-${m}-${y}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

/** Format a time-like value to HH:MM. `emptyLabel` is shown when value is missing */
const formatSessionTime = (value?: string | null, emptyLabel: string = "Not ended") => {
  if (!value) return emptyLabel;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatBreakDetails = (details?: string) => {
  if (!details) return "Completed break";

  try {
    const parsed = JSON.parse(details);
    if (!parsed || typeof parsed !== "object") return String(parsed);

    const values = Object.entries(parsed)
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
      .map(([key, value]) => `${BREAK_DETAIL_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}: ${String(value)}`);

    return values.length > 0 ? values.join(" | ") : "Completed break";
  } catch {
    return details;
  }
};

/** Break details → label/value pairs (for readable chips on screen) */
const parseBreakDetails = (details?: string): { label: string; value: string }[] => {
  if (!details) return [];
  try {
    const parsed = JSON.parse(details);
    if (!parsed || typeof parsed !== "object") return [{ label: "Note", value: String(parsed) }];
    return Object.entries(parsed)
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
      .map(([key, value]) => {
        const isDuration = key === "duration" || key === "customDuration";
        const raw = String(value);
        return {
          label: BREAK_DETAIL_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
          value: isDuration && /^\d+(\.\d+)?$/.test(raw) ? `${raw} min` : raw,
        };
      });
  } catch {
    return [{ label: "Note", value: details }];
  }
};

/** Normalize a date-like value to YYYY-MM-DD for grouping */
const toDateKey = (value?: string | null): string => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

interface AdminStats {
  totalEmployee: number;
  workingNow: number;
  onBreak: number;
  notStarted: number;
  targetMissed: number;
  totalProductiveHours: string;
}

interface EmployeeItem {
  employee_id: number;
  employee_name: string;
  email: string;
  role: string;
  department: string;
  target: string;
  target_seconds: number;
  worked: string;
  worked_seconds: number;
  break_time: string;
  break_seconds: number;
  productive: string;
  productive_seconds: number;
  current_state: string;
  status: "ACHIEVED" | "IN_PROGRESS" | "BEHIND" | "NOT_STARTED" | "PENDING";
}

interface EmployeeBreakItem {
  break_type?: string;
  started_at?: string;
  ended_at?: string;
  actual_duration?: number;
  allocated_duration?: number;
  efficiency?: string;
  details?: string;
}

interface EmployeeDailyItem {
  date: string;
  started_at?: string | null;
  ended_at?: string | null;
  target?: string;
  worked?: string;
  break_time?: string;
  productive?: string;
  status?: string;
}

type TypeSummary = Record<string, { count: number; seconds: number }>;

interface MergedDayRow {
  dateKey: string;
  dateLabel: string;
  weekday: string;
  daily?: EmployeeDailyItem;
  breaks: EmployeeBreakItem[];
  breakSeconds: number;
  breakCount: number;
  workedSec: number;
  totalBreakSec: number;
  productiveSec: number;
  status: string;
  typeSummary: TypeSummary;
}

interface PeriodGroup {
  key: string;
  label: string;
  sublabel: string;
  days: MergedDayRow[];
  workedSec: number;
  breakSec: number;
  productiveSec: number;
  breakCount: number;
  activeDays: number;
  achievedDays: number;
  behindDays: number;
  typeSummary: TypeSummary;
}

type ActivityView = "user_breakdown" | "activity_logs" | "agent_execution" | "daily_work_tracker";
type ReportView = "daily" | "weekly" | "monthly";
type DisplayMode = "table" | "chart";

interface AdminDailyWorkTrackerProps {
  activeView?: ActivityView;
  onActiveViewChange?: (view: ActivityView) => void;
}

// ── Small presentational pieces ─────────────────────────
const TONES = {
  slate: { bg: "#f8fafc", border: "#e2e8f0", color: "#334155" },
  orange: { bg: "#fff7ed", border: "#fed7aa", color: "#B85A10" },
  green: { bg: "#ecfdf5", border: "#a7f3d0", color: "#047857" },
};

const MetricPill: React.FC<{ value: string; tone: keyof typeof TONES }> = ({ value, tone }) => {
  const t = TONES[tone];
  return (
    <span
      className="inline-flex items-center justify-center min-w-[78px] rounded-lg px-2.5 py-1 font-mono font-semibold text-[11px]"
      style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.color }}
    >
      {value}
    </span>
  );
};

const BreakChip: React.FC<{ type: string; value: string; count?: number }> = ({ type, value, count }) => {
  const color = getBreakColor(type);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
      style={{ background: `${color}14`, border: `1px solid ${color}33`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span>{type}</span>
      {count && count > 1 ? <span className="opacity-70">×{count}</span> : null}
      <span className="font-mono text-slate-700">{value}</span>
    </span>
  );
};

const BreakChips: React.FC<{ summary: TypeSummary; max?: number }> = ({ summary, max = 3 }) => {
  const entries = Object.entries(summary).sort((a, b) => b[1].seconds - a[1].seconds);
  if (entries.length === 0) return <span className="text-[10px] text-slate-400">No breaks</span>;
  const shown = entries.slice(0, max);
  const rest = entries.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map(([type, s]) => (
        <BreakChip key={type} type={type} value={formatSeconds(s.seconds)} count={s.count} />
      ))}
      {rest > 0 && (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          +{rest} more
        </span>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Chart component — premium interactive grouped bar chart
// ═══════════════════════════════════════════════════════════
interface ChartDatum {
  key: string;
  label: string;
  sublabel?: string;
  workedSec: number;
  productiveSec: number;
  breakSec: number;
  isPeak?: boolean;
}

const ReportBarChart: React.FC<{ data: ChartDatum[]; height?: number }> = ({ data, height = 340 }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  // SVG layout
  const PADDING = { top: 26, right: 20, bottom: 56, left: 52 };
  const MIN_BAR_GROUP = 56;
  const MAX_BAR_GROUP = 120;

  const innerWidth = Math.max(560, data.length * MIN_BAR_GROUP);
  const svgWidth = innerWidth + PADDING.left + PADDING.right;
  const svgHeight = height;
  const plotW = innerWidth;
  const plotH = svgHeight - PADDING.top - PADDING.bottom;

  const maxVal = Math.max(
    60,
    ...data.map((d) => Math.max(d.workedSec, d.productiveSec, d.breakSec)),
  );
  // Round up to a nice step
  const niceMax = (() => {
    const stepChoices = [5 * 60, 10 * 60, 15 * 60, 30 * 60, 60 * 60, 2 * 3600, 4 * 3600, 6 * 3600, 8 * 3600, 12 * 3600, 24 * 3600];
    for (const s of stepChoices) if (maxVal <= s) return s;
    return Math.ceil(maxVal / 3600) * 3600;
  })();

  const groupWidth = Math.min(MAX_BAR_GROUP, Math.max(MIN_BAR_GROUP, plotW / Math.max(1, data.length)));
  const barGap = 4;
  const barWidth = Math.max(6, (groupWidth - 24 - barGap * 2) / 3);
  const barsTotal = barWidth * 3 + barGap * 2;

  const yTicks = 4;
  const yScale = (v: number) => plotH - (v / niceMax) * plotH;

  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => (niceMax / yTicks) * i);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="block"
        style={{ minWidth: "100%" }}
      >
        <defs>
          <linearGradient id="barWorked" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_WORKED} stopOpacity="0.95" />
            <stop offset="100%" stopColor={CHART_WORKED} stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="barProd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_PRODUCTIVE} stopOpacity="0.95" />
            <stop offset="100%" stopColor={CHART_PRODUCTIVE} stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="barBreak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_BREAK} stopOpacity="0.95" />
            <stop offset="100%" stopColor={CHART_BREAK} stopOpacity="0.72" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines + Y labels */}
        <g transform={`translate(${PADDING.left}, ${PADDING.top})`}>
          {yTickValues.map((v, i) => {
            const y = yScale(v);
            return (
              <g key={i}>
                <line x1={0} x2={plotW} y1={y} y2={y} stroke={i === 0 ? "#cbd5e1" : "#eef2f6"} strokeWidth={i === 0 ? 1 : 1} />
                <text x={-10} y={y + 3.5} textAnchor="end" fontSize="9.5" fill="#94a3b8" fontFamily="ui-monospace, monospace">
                  {formatCompact(v)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const x0 = i * (plotW / Math.max(1, data.length)) + (plotW / Math.max(1, data.length) - barsTotal) / 2;
            const isHover = hovered === i;
            const workedH = Math.max(0, (d.workedSec / niceMax) * plotH);
            const prodH = Math.max(0, (d.productiveSec / niceMax) * plotH);
            const breakH = Math.max(0, (d.breakSec / niceMax) * plotH);

            const workedY = plotH - workedH;
            const prodY = plotH - prodH;
            const breakY = plotH - breakH;

            return (
              <g
                key={d.key}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Hover background */}
                <rect
                  x={x0 - 10}
                  y={0}
                  width={barsTotal + 20}
                  height={plotH}
                  fill={isHover ? "rgba(11,56,84,0.045)" : "transparent"}
                  rx={6}
                />

                {/* Worked bar */}
                <rect
                  x={x0}
                  y={workedY}
                  width={barWidth}
                  height={workedH}
                  rx={3}
                  fill="url(#barWorked)"
                  opacity={hovered === null || isHover ? 1 : 0.55}
                  style={{ transition: "opacity 150ms ease" }}
                />
                {/* Productive bar */}
                <rect
                  x={x0 + barWidth + barGap}
                  y={prodY}
                  width={barWidth}
                  height={prodH}
                  rx={3}
                  fill="url(#barProd)"
                  opacity={hovered === null || isHover ? 1 : 0.55}
                  style={{ transition: "opacity 150ms ease" }}
                />
                {/* Break bar */}
                <rect
                  x={x0 + (barWidth + barGap) * 2}
                  y={breakY}
                  width={barWidth}
                  height={breakH}
                  rx={3}
                  fill="url(#barBreak)"
                  opacity={hovered === null || isHover ? 1 : 0.55}
                  style={{ transition: "opacity 150ms ease" }}
                />

                {/* Peak star */}
                {d.isPeak && (
                  <g transform={`translate(${x0 + barsTotal / 2}, ${Math.min(workedY, prodY, breakY) - 10})`}>
                    <circle r="7" fill={ORANGE} opacity="0.18" />
                    <circle r="2.6" fill={ORANGE} />
                  </g>
                )}

                {/* X label */}
                <text
                  x={x0 + barsTotal / 2}
                  y={plotH + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={isHover ? NAVY : "#475569"}
                  fontFamily="ui-monospace, monospace"
                >
                  {d.label}
                </text>
                {d.sublabel && (
                  <text
                    x={x0 + barsTotal / 2}
                    y={plotH + 30}
                    textAnchor="middle"
                    fontSize="8.5"
                    fill="#94a3b8"
                  >
                    {d.sublabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* Baseline */}
          <line x1={0} x2={plotW} y1={plotH} y2={plotH} stroke="#cbd5e1" strokeWidth="1" />
        </g>

        {/* Tooltip */}
        {hovered !== null && (() => {
          const d = data[hovered];
          const groupCenterX =
            PADDING.left +
            hovered * (plotW / Math.max(1, data.length)) +
            plotW / Math.max(1, data.length) / 2;
          const tooltipW = 176;
          const tooltipH = 92;
          const tx = Math.max(8, Math.min(svgWidth - tooltipW - 8, groupCenterX - tooltipW / 2));
          const ty = PADDING.top + 6;
          return (
            <g pointerEvents="none">
              <rect x={tx} y={ty} width={tooltipW} height={tooltipH} rx={10} fill="#0B3854" opacity="0.97" />
              <rect x={tx} y={ty} width={tooltipW} height={tooltipH} rx={10} fill="none" stroke={ORANGE} strokeWidth="1" opacity="0.6" />
              <text x={tx + 12} y={ty + 18} fontSize="10.5" fontWeight="700" fill="#fff">
                {d.label}
                {d.sublabel ? ` · ${d.sublabel}` : ""}
              </text>
              <g transform={`translate(${tx + 12}, ${ty + 28})`}>
                <circle cx={4} cy={4} r={3.5} fill={CHART_WORKED} />
                <text x={14} y={7} fontSize="9.5" fill="#cbd5e1">Worked</text>
                <text x={tooltipW - 14} y={7} fontSize="10" fontWeight="700" fill="#fff" textAnchor="end" fontFamily="ui-monospace, monospace">
                  {formatCompact(d.workedSec)}
                </text>
              </g>
              <g transform={`translate(${tx + 12}, ${ty + 46})`}>
                <circle cx={4} cy={4} r={3.5} fill={CHART_PRODUCTIVE} />
                <text x={14} y={7} fontSize="9.5" fill="#cbd5e1">Productive</text>
                <text x={tooltipW - 14} y={7} fontSize="10" fontWeight="700" fill="#fff" textAnchor="end" fontFamily="ui-monospace, monospace">
                  {formatCompact(d.productiveSec)}
                </text>
              </g>
              <g transform={`translate(${tx + 12}, ${ty + 64})`}>
                <circle cx={4} cy={4} r={3.5} fill={CHART_BREAK} />
                <text x={14} y={7} fontSize="9.5" fill="#cbd5e1">Break</text>
                <text x={tooltipW - 14} y={7} fontSize="10" fontWeight="700" fill="#fff" textAnchor="end" fontFamily="ui-monospace, monospace">
                  {formatCompact(d.breakSec)}
                </text>
              </g>
              <text x={tx + 12} y={ty + tooltipH - 6} fontSize="8.5" fill="#94a3b8">
                Productive: {d.workedSec ? Math.round((d.productiveSec / d.workedSec) * 100) : 0}% of worked time
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};

export const AdminDailyWorkTracker: React.FC<AdminDailyWorkTrackerProps> = ({
  activeView = "daily_work_tracker",
  onActiveViewChange,
}) => {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [showEmployeePage, setShowEmployeePage] = useState<boolean>(false);

  const [employeeBreaks, setEmployeeBreaks] = useState<EmployeeBreakItem[]>([]);
  const [employeeDailyItems, setEmployeeDailyItems] = useState<EmployeeDailyItem[]>([]);
  const [employeeBreaksLoading, setEmployeeBreaksLoading] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [reportView, setReportView] = useState<ReportView>("daily");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("table");

  const printableRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [colSearches, setColSearches] = useState({
    name: "",
    dept: "",
    target: "",
    worked: "",
    break: "",
    productive: "",
    state: "",
    status: "",
  });

  const [stats, setStats] = useState<AdminStats>({
    totalEmployee: 0,
    workingNow: 0,
    onBreak: 0,
    notStarted: 0,
    targetMissed: 0,
    totalProductiveHours: "0h 0m",
  });
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  const [targetModalOpen, setTargetModalOpen] = useState<boolean>(false);
  const [targetEmp, setTargetEmp] = useState<EmployeeItem | null>(null);
  const [newTargetHours, setNewTargetHours] = useState<number>(8);
  const [settingTarget, setSettingTarget] = useState<boolean>(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteEmp, setDeleteEmp] = useState<EmployeeItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [breakMasterOpen, setBreakMasterOpen] = useState<boolean>(false);

  // ── bulk selection & bulk delete ──
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState<boolean>(false);
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await workSessionAPI.getAdminDailyUpdates(undefined, fromDate || undefined, toDate || undefined);
      if (res?.success) {
        if (res.stats) setStats(res.stats);
        if (Array.isArray(res.data)) setEmployees(res.data);
      }
    } catch (err) {
      console.error("Failed to load admin daily work updates:", err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, colSearches, fromDate, toDate, pageSize]);

  useEffect(() => {
    setSelectedEmployeeIds(new Set());
  }, [searchTerm, colSearches, fromDate, toDate]);

  const handleColSearch = (key: keyof typeof colSearches, value: string) => {
    setColSearches((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveTarget = async () => {
    if (!targetEmp) return;
    setSettingTarget(true);
    try {
      const targetDateForSave = toDate || fromDate || new Date().toISOString().split("T")[0];
      await workSessionAPI.setEmployeeTarget({
        employeeId: targetEmp.employee_id,
        targetDate: targetDateForSave,
        targetHours: newTargetHours,
      });
      setTargetModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error("Failed to update employee target:", err);
    } finally {
      setSettingTarget(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteEmp) return;
    setDeleting(true);
    try {
      console.log("Deleting employee:", deleteEmp.employee_id);
      setEmployees((prev) => prev.filter((e) => e.employee_id !== deleteEmp.employee_id));
      setDeleteModalOpen(false);
      setDeleteEmp(null);
    } catch (err) {
      console.error("Failed to delete employee:", err);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectEmployee = (id: number) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedEmployeeIds(new Set());

  const toggleSelectAllFiltered = () => {
    setSelectedEmployeeIds((prev) => {
      const allFilteredIds = filteredEmployeesRef.current.map((e) => e.employee_id);
      const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        allFilteredIds.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      allFilteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedEmployeeIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedEmployeeIds);
      console.log("Bulk deleting employees:", ids);
      setEmployees((prev) => prev.filter((e) => !selectedEmployeeIds.has(e.employee_id)));
      setBulkDeleteModalOpen(false);
      clearSelection();
    } catch (err) {
      console.error("Failed to bulk delete employees:", err);
    } finally {
      setBulkDeleting(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchTerm.toLowerCase().trim();
      if (q) {
        const matchesGlobal =
          (emp.employee_name && emp.employee_name.toLowerCase().includes(q)) ||
          (emp.email && emp.email.toLowerCase().includes(q)) ||
          (emp.department && emp.department.toLowerCase().includes(q)) ||
          (emp.role && emp.role.toLowerCase().includes(q));
        if (!matchesGlobal) return false;
      }

      const matchName = !colSearches.name || (emp.employee_name && emp.employee_name.toLowerCase().includes(colSearches.name.toLowerCase()));
      const matchDept = !colSearches.dept || (emp.department && emp.department.toLowerCase().includes(colSearches.dept.toLowerCase())) || (emp.role && emp.role.toLowerCase().includes(colSearches.dept.toLowerCase()));
      const matchTarget = !colSearches.target || (emp.target && emp.target.includes(colSearches.target));
      const matchWorked = !colSearches.worked || (emp.worked && emp.worked.includes(colSearches.worked));
      const matchBreak = !colSearches.break || (emp.break_time && emp.break_time.includes(colSearches.break));
      const matchProductive = !colSearches.productive || (emp.productive && emp.productive.includes(colSearches.productive));
      const matchState = !colSearches.state || (emp.current_state && emp.current_state.toLowerCase().includes(colSearches.state.toLowerCase()));
      const matchStatus = !colSearches.status || (emp.status && emp.status === colSearches.status);

      return matchName && matchDept && matchTarget && matchWorked && matchBreak && matchProductive && matchState && matchStatus;
    });
  }, [employees, searchTerm, colSearches]);

  const filteredEmployeesRef = useRef<EmployeeItem[]>(filteredEmployees);
  useEffect(() => {
    filteredEmployeesRef.current = filteredEmployees;
  }, [filteredEmployees]);

  const selectedEmployee = filteredEmployees.find((emp) => emp.employee_id === selectedEmployeeId) || employees.find((emp) => emp.employee_id === selectedEmployeeId) || null;

  const openEmployeeDetails = async (employee: EmployeeItem) => {
    setSelectedEmployeeId(employee.employee_id);
    setShowEmployeePage(true);
    setExpandedDates(new Set());
    setReportView("daily");
    setDisplayMode("table");
  };

  const closeEmployeePage = () => {
    setShowEmployeePage(false);
    setSelectedEmployeeId(null);
    setEmployeeBreaks([]);
    setEmployeeDailyItems([]);
    setExpandedDates(new Set());
  };

  useEffect(() => {
    if (!showEmployeePage || selectedEmployeeId === null) return;
    let cancelled = false;
    const loadEmployeeBreaks = async () => {
      setEmployeeBreaksLoading(true);
      try {
        const today = dateToKey(new Date());
        const res = await workSessionAPI.getEmployeeBreakHistory(
          selectedEmployeeId,
          fromDate || today,
          toDate || fromDate || today,
        );
        if (!cancelled) {
          setEmployeeBreaks(res?.success && Array.isArray(res.breaks) ? res.breaks : []);
        }

        const dailyRes = await workSessionAPI.getEmployeeDailyUpdates(
          selectedEmployeeId,
          undefined,
          fromDate || today,
          toDate || fromDate || today,
        );
        if (!cancelled) {
          setEmployeeDailyItems(dailyRes?.success && Array.isArray(dailyRes.updates) ? dailyRes.updates : []);
        }
      } catch (err) {
        console.error("Failed to load employee break details:", err);
        if (!cancelled) setEmployeeBreaks([]);
        if (!cancelled) setEmployeeDailyItems([]);
      } finally {
        if (!cancelled) setEmployeeBreaksLoading(false);
      }
    };
    loadEmployeeBreaks();
    return () => { cancelled = true; };
  }, [showEmployeePage, selectedEmployeeId, fromDate, toDate]);

  const breakTypeSummary = useMemo(() => {
    return employeeBreaks.reduce<TypeSummary>((summary, item) => {
      const type = normType(item.break_type);
      if (!summary[type]) summary[type] = { count: 0, seconds: 0 };
      summary[type].count += 1;
      summary[type].seconds += Number(item.actual_duration || 0);
      return summary;
    }, {});
  }, [employeeBreaks]);

  const breakTypeList = useMemo(
    () => Object.entries(breakTypeSummary).sort((a, b) => b[1].seconds - a[1].seconds),
    [breakTypeSummary],
  );

  const mergedDayRows: MergedDayRow[] = useMemo(() => {
    const map = new Map<string, MergedDayRow>();

    const ensureRow = (key: string): MergedDayRow => {
      let row = map.get(key);
      if (!row) {
        row = {
          dateKey: key,
          dateLabel: formatDateDDMMYYYY(key),
          weekday: "",
          daily: undefined,
          breaks: [],
          breakSeconds: 0,
          breakCount: 0,
          workedSec: 0,
          totalBreakSec: 0,
          productiveSec: 0,
          status: "PENDING",
          typeSummary: {},
        };
        map.set(key, row);
      }
      return row;
    };

    employeeDailyItems.forEach((d) => {
      const key = toDateKey(d.date);
      if (!key) return;
      ensureRow(key).daily = d;
    });

    employeeBreaks.forEach((b) => {
      const key = toDateKey(b.started_at) || toDateKey(b.ended_at);
      if (!key) return;
      const row = ensureRow(key);
      const dur = Number(b.actual_duration || 0);
      const type = normType(b.break_type);
      row.breaks.push(b);
      row.breakSeconds += dur;
      row.breakCount += 1;
      if (!row.typeSummary[type]) row.typeSummary[type] = { count: 0, seconds: 0 };
      row.typeSummary[type].count += 1;
      row.typeSummary[type].seconds += dur;
    });

    return Array.from(map.values())
      .map((row) => {
        const daily = row.daily;
        const workedSec = parseDuration(daily?.worked);
        const totalBreakSec = daily?.break_time ? parseDuration(daily.break_time) : row.breakSeconds;
        const productiveSec = daily?.productive ? parseDuration(daily.productive) : Math.max(0, workedSec - totalBreakSec);
        return {
          ...row,
          weekday: keyToDate(row.dateKey).toLocaleDateString("en-GB", { weekday: "short" }),
          workedSec,
          totalBreakSec,
          productiveSec,
          status: daily?.status || "PENDING",
        };
      })
      .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
  }, [employeeDailyItems, employeeBreaks]);

  const periodGroups: PeriodGroup[] = useMemo(() => {
    if (reportView === "daily") return [];
    const map = new Map<string, PeriodGroup>();

    mergedDayRows.forEach((row) => {
      const dt = keyToDate(row.dateKey);
      let key = "";
      let label = "";
      let sublabel = "";

      if (reportView === "weekly") {
        const start = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - ((dt.getDay() + 6) % 7));
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
        key = dateToKey(start);
        label = `${formatShort(start)} – ${formatShort(end)}`;
        sublabel = `Week ${getISOWeek(start)} · ${end.getFullYear()}`;
      } else {
        key = row.dateKey.slice(0, 7);
        label = dt.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      }

      let g = map.get(key);
      if (!g) {
        g = {
          key, label, sublabel, days: [],
          workedSec: 0, breakSec: 0, productiveSec: 0, breakCount: 0,
          activeDays: 0, achievedDays: 0, behindDays: 0, typeSummary: {},
        };
        map.set(key, g);
      }
      g.days.push(row);
      g.workedSec += row.workedSec;
      g.breakSec += row.totalBreakSec;
      g.productiveSec += row.productiveSec;
      g.breakCount += row.breakCount;
      if (row.workedSec > 0) g.activeDays += 1;
      if (row.status === "ACHIEVED") g.achievedDays += 1;
      if (row.status === "BEHIND") g.behindDays += 1;
      Object.entries(row.typeSummary).forEach(([t, s]) => {
        if (!g!.typeSummary[t]) g!.typeSummary[t] = { count: 0, seconds: 0 };
        g!.typeSummary[t].count += s.count;
        g!.typeSummary[t].seconds += s.seconds;
      });
    });

    return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [mergedDayRows, reportView]);

  const totals = useMemo(() => {
    const worked = mergedDayRows.reduce((s, r) => s + r.workedSec, 0);
    const brk = mergedDayRows.reduce((s, r) => s + r.totalBreakSec, 0);
    const prod = mergedDayRows.reduce((s, r) => s + r.productiveSec, 0);
    const activeDays = mergedDayRows.filter((r) => r.workedSec > 0).length;
    const achieved = mergedDayRows.filter((r) => r.status === "ACHIEVED").length;
    const behind = mergedDayRows.filter((r) => r.status === "BEHIND").length;
    return {
      worked,
      brk,
      prod,
      activeDays,
      achieved,
      behind,
      avgProd: activeDays ? prod / activeDays : 0,
      prodPct: worked ? Math.round((prod / worked) * 100) : 0,
      breakCount: employeeBreaks.length,
    };
  }, [mergedDayRows, employeeBreaks]);

  // ── Chart data derived from the current report view ──
  const chartData: ChartDatum[] = useMemo(() => {
    if (reportView === "daily") {
      // For daily, show each day in chronological order (oldest → newest)
      const rows = [...mergedDayRows].sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1));
      const peak = rows.reduce((best, r) => (r.productiveSec > (best?.productiveSec ?? -1) ? r : best), rows[0]);
      return rows.map((r) => ({
        key: r.dateKey,
        label: keyToDate(r.dateKey).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        sublabel: r.weekday,
        workedSec: r.workedSec,
        productiveSec: r.productiveSec,
        breakSec: r.totalBreakSec,
        isPeak: peak && peak.dateKey === r.dateKey && peak.productiveSec > 0,
      }));
    }

    // Weekly / Monthly: oldest → newest
    const groups = [...periodGroups].sort((a, b) => (a.key < b.key ? -1 : 1));
    const peak = groups.reduce((best, g) => (g.productiveSec > (best?.productiveSec ?? -1) ? g : best), groups[0]);
    return groups.map((g) => {
      let label = g.label;
      let sublabel = g.sublabel;
      if (reportView === "monthly") {
        const [y, m] = g.key.split("-");
        const dt = new Date(Number(y), Number(m) - 1, 1);
        label = dt.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
        sublabel = `${g.activeDays} active day${g.activeDays === 1 ? "" : "s"}`;
      } else {
        label = g.label.replace("–", "→").replace("  ", " ");
        sublabel = g.sublabel;
      }
      return {
        key: g.key,
        label,
        sublabel,
        workedSec: g.workedSec,
        productiveSec: g.productiveSec,
        breakSec: g.breakSec,
        isPeak: peak && peak.key === g.key && peak.productiveSec > 0,
      };
    });
  }, [mergedDayRows, periodGroups, reportView]);

  const toggleDate = (key: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const currentKeys = reportView === "daily" ? mergedDayRows.map((r) => r.dateKey) : periodGroups.map((g) => g.key);
  const allExpanded = currentKeys.length > 0 && currentKeys.every((k) => expandedDates.has(k));

  const toggleAllDates = () => {
    if (allExpanded) setExpandedDates(new Set());
    else setExpandedDates(new Set(currentKeys));
  };

  const applyPreset = (id: PresetId) => {
    const { from, to } = getPresetRange(id);
    setFromDate(from);
    setToDate(to);
    setExpandedDates(new Set());
  };

  const handleChangeReportView = (view: ReportView) => {
    setReportView(view);
    setExpandedDates(new Set());
    const now = new Date();
    const today = dateToKey(now);
    const from = fromDate || today;
    const to = toDate || fromDate || today;
    const spanDays = Math.round((keyToDate(to).getTime() - keyToDate(from).getTime()) / 86400000) + 1;

    if (view === "weekly" && spanDays < 14) {
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) - 21);
      setFromDate(dateToKey(monday));
      setToDate(today);
    }
    if (view === "monthly" && spanDays < 45) {
      setFromDate(dateToKey(new Date(now.getFullYear(), now.getMonth() - 2, 1)));
      setToDate(today);
    }
  };

  const totalRecords = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pagedEmployees = filteredEmployees.slice(startIdx, startIdx + pageSize);
  const showingFrom = totalRecords === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + pageSize, totalRecords);
  const fillerCount = Math.max(0, pageSize - pagedEmployees.length);

  const pageIds = pagedEmployees.map((e) => e.employee_id);
  const selectedOnPage = pageIds.filter((id) => selectedEmployeeIds.has(id));
  const isAllPageSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const isSomePageSelected = selectedOnPage.length > 0 && !isAllPageSelected;

  const handleToggleSelectPage = () => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (isAllPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const detailRangeLabel = fromDate || toDate
    ? `${fromDate ? formatDateDDMMYYYY(fromDate) : "Start"} to ${toDate ? formatDateDDMMYYYY(toDate) : "End"}`
    : "Today";

  const reportTitle = reportView === "daily" ? "Daily report" : reportView === "weekly" ? "Weekly report" : "Monthly report";

  // ═══════════════════════════════════════════════════════════
  // PDF (includes summary tables)
  // ═══════════════════════════════════════════════════════════
  const handleDownloadPDF = async () => {
    if (!selectedEmployee) return;
    setDownloadingPdf(true);
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;

      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const drawTable = (options: {
        startY: number;
        head: string[];
        body: string[][];
        widths: number[];
        fontSize?: number;
        headerFontSize?: number;
      }) => {
        const fontSize = options.fontSize || 9;
        const headerFontSize = options.headerFontSize || fontSize;
        const left = 40;
        const right = pageWidth - 40;
        let currentY = options.startY;

        const headerLines: string[][] = options.head.map((cell, index) => {
          const width = options.widths[index] || (right - left) / options.head.length;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(headerFontSize);
          return doc.splitTextToSize(String(cell || "-"), Math.max(10, width - 12));
        });
        const maxHeaderLines = Math.max(1, ...headerLines.map((lines) => lines.length));
        const headerRowHeight = Math.max(22, maxHeaderLines * (headerFontSize + 2) + 8);

        const drawRow = (cells: string[], header = false, customRowHeight?: number) => {
          const rowHeight = customRowHeight || 22;
          if (currentY + rowHeight > pageHeight - 50) {
            doc.addPage();
            currentY = 40;
          }

          let x = left;
          cells.forEach((cell, index) => {
            const width = options.widths[index] || (right - left) / cells.length;
            doc.setFillColor(...(header ? [11, 56, 84] : [255, 255, 255]) as [number, number, number]);
            doc.rect(x, currentY, width, rowHeight, "F");
            doc.setDrawColor(219, 228, 238);
            doc.rect(x, currentY, width, rowHeight, "S");
            doc.setTextColor(...(header ? [255, 255, 255] : [30, 41, 59]) as [number, number, number]);
            doc.setFont("helvetica", header ? "bold" : "normal");
            doc.setFontSize(header ? headerFontSize : fontSize);

            if (header) {
              const lines = doc.splitTextToSize(String(cell || "-"), Math.max(10, width - 12));
              const lineHeight = headerFontSize + 2;
              const totalTextHeight = lines.length * lineHeight;
              const startTextY = currentY + (rowHeight - totalTextHeight) / 2 + headerFontSize - 2;
              lines.forEach((line: string, lineIndex: number) => {
                doc.text(line, x + 6, startTextY + lineIndex * lineHeight, { maxWidth: Math.max(10, width - 12) });
              });
            } else {
              doc.text(String(cell || "-"), x + 6, currentY + 14, { maxWidth: Math.max(10, width - 12) });
            }
            x += width;
          });
          currentY += rowHeight;
        };

        drawRow(options.head, true, headerRowHeight);
        options.body.forEach((row) => drawRow(row));
        (doc as any).lastAutoTable = { finalY: currentY };
      };

      doc.setFillColor(11, 56, 84);
      doc.rect(0, 0, pageWidth, 80, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Employee Activity Report", 40, 35);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 55);
      doc.text(`Report Period: ${detailRangeLabel}`, pageWidth - 40, 55, { align: "right" });

      let yPos = 110;
      doc.setTextColor(11, 56, 84);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(selectedEmployee.employee_name || "N/A", 40, yPos);

      yPos += 20;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text(`${selectedEmployee.department || "General"}  |  ${selectedEmployee.role || "Agent"}`, 40, yPos);

      yPos += 16;
      doc.text(`Email: ${selectedEmployee.email || "N/A"}`, 40, yPos);

      yPos += 16;
      doc.setDrawColor(219, 228, 238);
      doc.setLineWidth(1);
      doc.line(40, yPos, pageWidth - 40, yPos);

      yPos += 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(11, 56, 84);
      doc.text("Performance Summary", 40, yPos);

      yPos += 10;
      const cardY = yPos;
      const cardHeight = 55;
      const cardGap = 10;
      const cardWidth = (pageWidth - 80 - cardGap * 3) / 4;

      const summaryCards = [
        { label: "Total Working Hours", value: formatSeconds(totals.worked), color: [11, 56, 84] },
        { label: "Break Time", value: formatSeconds(totals.brk), color: [184, 90, 16] },
        { label: "Productive Hours", value: formatSeconds(totals.prod), color: [5, 150, 105] },
        { label: "Active Days", value: `${totals.activeDays} / ${mergedDayRows.length}`, color: [11, 56, 84] },
      ];

      summaryCards.forEach((card, i) => {
        const x = 40 + i * (cardWidth + cardGap);
        doc.setFillColor(244, 247, 250);
        doc.roundedRect(x, cardY, cardWidth, cardHeight, 6, 6, "F");
        doc.setDrawColor(219, 228, 238);
        doc.roundedRect(x, cardY, cardWidth, cardHeight, 6, 6, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(card.label.toUpperCase(), x + 8, cardY + 16);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(card.color[0], card.color[1], card.color[2]);
        doc.text(String(card.value), x + 8, cardY + 38);
      });

      yPos = cardY + cardHeight + 25;

      const ensureSpace = (needed: number) => {
        if (yPos + needed > pageHeight - 60) {
          doc.addPage();
          yPos = 50;
        }
      };

      ensureSpace(60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(11, 56, 84);
      doc.text(reportView === "daily" ? "Day-wise Summary" : reportView === "weekly" ? "Weekly Summary" : "Monthly Summary", 40, yPos);
      yPos += 8;

      if (reportView === "daily") {
        drawTable({
          startY: yPos,
          head: ["Date", "Started", "Ended", "Worked", "Break", "Productive", "Status"],
          body: mergedDayRows.length > 0
            ? mergedDayRows.map((r) => [
              r.dateLabel,
              formatSessionTime(r.daily?.started_at, "-"),
              formatSessionTime(r.daily?.ended_at, "Not ended"),
              formatSeconds(r.workedSec),
              formatSeconds(r.totalBreakSec),
              formatSeconds(r.productiveSec),
              r.status.replace("_", " "),
            ])
            : [["No data", "-", "-", "-", "-", "-", "-"]],
          widths: [70, 50, 60, 70, 65, 75, 85],
          fontSize: 8.5,
          headerFontSize: 8,
        });
      } else {
        drawTable({
          startY: yPos,
          head: [reportView === "weekly" ? "Week" : "Month", "Active Days", "Worked", "Break", "Productive", "Avg / Day", "Achieved / Behind"],
          body: periodGroups.length > 0
            ? periodGroups.map((g) => [
              g.label.replace("–", "to"),
              String(g.activeDays),
              formatHM(g.workedSec),
              formatHM(g.breakSec),
              formatHM(g.productiveSec),
              formatHM(g.activeDays ? g.productiveSec / g.activeDays : 0),
              `${g.achievedDays} / ${g.behindDays}`,
            ])
            : [["No data", "-", "-", "-", "-", "-", "-"]],
          widths: [105, 45, 55, 50, 60, 55, 75],
          fontSize: 8.5,
          headerFontSize: 7.5,
        });
      }

      // @ts-ignore
      yPos = (doc as any).lastAutoTable.finalY + 25;

      ensureSpace(60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(11, 56, 84);
      doc.text("Break Types Taken", 40, yPos);

      yPos += 8;
      const breakTypeRows = breakTypeList.map(([type, summary]) => [
        type,
        `${summary.count} break${summary.count === 1 ? "" : "s"}`,
        formatSeconds(summary.seconds),
      ]);

      drawTable({
        startY: yPos,
        head: ["Break Type", "Count", "Total Duration"],
        body: breakTypeRows.length > 0 ? breakTypeRows : [["No breaks recorded", "-", "-"]],
        widths: [200, 100, 150],
        fontSize: 10,
        headerFontSize: 10,
      });

      // @ts-ignore
      yPos = (doc as any).lastAutoTable.finalY + 25;

      ensureSpace(60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(11, 56, 84);
      doc.text("Break Activity Log", 40, yPos);

      yPos += 8;

      const breakActivityRows = employeeBreaks.map((item) => {
        const actualSeconds = Number(item.actual_duration || 0);
        const allocatedSeconds = Number(item.allocated_duration || 0) * 60;
        const efficiency =
          allocatedSeconds > 0
            ? Math.min(100, Math.round((allocatedSeconds / Math.max(actualSeconds, allocatedSeconds)) * 100))
            : Number.parseInt(String(item.efficiency || "0"), 10) || 0;
        const started = item.started_at ? new Date(item.started_at) : null;
        const startedValid = started && !Number.isNaN(started.getTime());
        const startedStr = startedValid
          ? `${started!.toLocaleDateString([], { day: "2-digit", month: "short" })} ${started!.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
          : "—";
        return [
          normType(item.break_type),
          startedStr,
          formatSeconds(actualSeconds),
          `${efficiency}%`,
          formatBreakDetails(item.details),
        ];
      });

      drawTable({
        startY: yPos,
        head: ["Break Type", "Date / Time", "Duration", "Efficiency", "Details"],
        body: breakActivityRows.length > 0 ? breakActivityRows : [["No break activity found", "-", "-", "-", "-"]],
        widths: [80, 90, 65, 65, pageWidth - 80 - 300],
        fontSize: 9,
        headerFontSize: 9,
      });

      const totalPagesCount = doc.getNumberOfPages();
      for (let i = 1; i <= totalPagesCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(219, 228, 238);
        doc.setLineWidth(0.5);
        doc.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Admin Daily Work Tracker - Confidential", 40, pageHeight - 25);
        doc.text(`Page ${i} of ${totalPagesCount}`, pageWidth - 40, pageHeight - 25, { align: "right" });
      }

      const safeName = (selectedEmployee.employee_name || "employee").replace(/\s+/g, "_");
      const dateStamp = new Date().toISOString().split("T")[0];
      doc.save(`${safeName}_Activity_Report_${dateStamp}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACHIEVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Achieved
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-[#0B3854]/[0.07] text-[#0B3854] border border-[#0B3854]/15 animate-pulse">
            <TrendingUp className="w-3 h-3 text-[#11507A]" /> In progress
          </span>
        );
      case "BEHIND":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Behind
          </span>
        );
      case "NOT_STARTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-400" /> Not started
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200">
            Pending
          </span>
        );
    }
  };

  const getLiveStateBadge = (state: string) => {
    if (state === "BREAK") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-[#E6761D]/10 text-[#B85A10] border border-[#E6761D]/25">
          <Coffee className="w-3 h-3 text-[#E6761D]" /> On Break
        </span>
      );
    }
    if (["ACTIVE", "ACTIVITY_CHECK", "RUNNING"].includes(state)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-70 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </span>
          Working Now
        </span>
      );
    }
    if (state === "LOGGED_OUT") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200">
          <LogOut className="w-3 h-3 text-slate-400" /> Logged Out
        </span>
      );
    }
    if (state === "IDLE") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200">
          Idle
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-slate-100 text-slate-500">
        Not Started
      </span>
    );
  };

  const getEfficiencyMeta = (item: EmployeeBreakItem) => {
    const actualSeconds = Number(item.actual_duration || 0);
    const allocatedSeconds = Number(item.allocated_duration || 0) * 60;
    const efficiency = allocatedSeconds > 0
      ? Math.min(100, Math.round((allocatedSeconds / Math.max(actualSeconds, allocatedSeconds)) * 100))
      : Number.parseInt(String(item.efficiency || "0"), 10) || 0;
    const label = efficiency >= 90 ? "Stable" : efficiency >= 75 ? "Watch" : "Review";
    const color = efficiency >= 90 ? "#059669" : efficiency >= 75 ? "#b45309" : "#dc2626";
    return { efficiency, label, color };
  };

  const metrics = [
    { label: "Total Employees", value: stats.totalEmployee, icon: Users, tint: NAVY, mono: false, pulse: false },
    { label: "Working Now", value: stats.workingNow, icon: PlayCircle, tint: "#16a34a", mono: false, pulse: true },
    { label: "On Break", value: stats.onBreak, icon: Coffee, tint: ORANGE, mono: false, pulse: false },
    { label: "Not Started", value: stats.notStarted, icon: Clock, tint: "#64748b", mono: false, pulse: false },
    { label: "Target Missed", value: stats.targetMissed, icon: AlertTriangle, tint: "#e11d48", mono: false, pulse: false },
    { label: "Productive Hrs", value: stats.totalProductiveHours, icon: Zap, tint: NAVY_SOFT, mono: true, pulse: false },
  ];

  const pageBtn = "min-w-[28px] h-7 px-2 flex items-center justify-center rounded-md text-[11px] font-semibold transition-all";

  // ═══════════════════════════════════════════════════════════
  // RENDER: EMPLOYEE REPORT PAGE
  // ═══════════════════════════════════════════════════════════
  if (showEmployeePage && selectedEmployee) {
    const todayKey = dateToKey(new Date());
    const firstName = (selectedEmployee.employee_name || "Employee").trim().split(/\s+/)[0];
    const topBreak = breakTypeList[0];
    const totalBreakTypeSeconds = breakTypeList.reduce((s, [, v]) => s + v.seconds, 0);

    const viewTabs: { id: ReportView; label: string }[] = [
      { id: "daily", label: "Daily" },
      { id: "weekly", label: "Weekly" },
      { id: "monthly", label: "Monthly" },
    ];
    const presets: { id: PresetId; label: string }[] = [
      { id: "today", label: "Today" },
      { id: "week", label: "This week" },
      { id: "month", label: "This month" },
      { id: "lastMonth", label: "Last month" },
    ];
    const isPresetActive = (id: PresetId) => {
      const r = getPresetRange(id);
      return fromDate === r.from && toDate === r.to;
    };

    const kpis = [
      { label: "Total worked", value: formatHM(totals.worked), sub: formatSeconds(totals.worked), icon: Clock, color: NAVY, bg: "#eef3f8" },
      { label: "Productive time", value: formatHM(totals.prod), sub: `${totals.prodPct}% of worked time`, icon: Zap, color: "#059669", bg: "#ecfdf5" },
      { label: "Break time", value: formatHM(totals.brk), sub: `${totals.breakCount} break${totals.breakCount === 1 ? "" : "s"} taken`, icon: Coffee, color: "#B85A10", bg: "#fff7ed" },
      { label: "Active days", value: String(totals.activeDays), sub: `of ${mergedDayRows.length} day${mergedDayRows.length === 1 ? "" : "s"} in range`, icon: CalendarDays, color: NAVY_SOFT, bg: "#eef3f8" },
      { label: "Avg productive / day", value: formatHM(totals.avgProd), sub: "per active day", icon: Timer, color: "#059669", bg: "#ecfdf5" },
      { label: "Target achieved", value: `${totals.achieved}`, sub: `${totals.behind} day${totals.behind === 1 ? "" : "s"} behind`, icon: Target, color: ORANGE, bg: "#fff7ed" },
    ];

    const thBase = "px-3 py-2.5 text-[9.5px] font-semibold uppercase tracking-wide";

    const renderBreakDetailTable = (breaks: EmployeeBreakItem[], totalSeconds: number) => (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-[#f4f7fa] border-b border-slate-200">
          <Coffee className="w-3.5 h-3.5" style={{ color: ORANGE }} />
          <span className="text-[11px] font-bold" style={{ color: NAVY }}>Break activity</span>
          <span className="text-[10px] text-slate-500">
            {breaks.length} break{breaks.length === 1 ? "" : "s"}
          </span>
          <span className="ml-auto text-[10.5px] font-semibold text-slate-600">
            Total <span className="font-mono" style={{ color: "#B85A10" }}>{formatSeconds(totalSeconds)}</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-white text-slate-500" style={{ borderBottom: `1px solid ${V_LINE}` }}>
                <th className={thBase} style={{ width: "18%" }}>Break type</th>
                <th className={thBase} style={{ width: "20%" }}>Started – Ended</th>
                <th className={thBase} style={{ width: "13%" }}>Duration</th>
                <th className={thBase} style={{ width: "15%" }}>Efficiency</th>
                <th className={thBase}>Details</th>
              </tr>
            </thead>
            <tbody>
              {breaks.map((item, index) => {
                const { efficiency, label, color } = getEfficiencyMeta(item);
                const type = normType(item.break_type);
                const typeColor = getBreakColor(type);
                const pairs = parseBreakDetails(item.details);
                return (
                  <tr key={`${item.break_type}-${item.started_at}-${index}`} className="hover:bg-slate-50/60 transition-colors" style={{ borderTop: `1px solid ${V_LINE}` }}>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                        <span className="w-2 h-2 rounded-full" style={{ background: typeColor }} />
                        {type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-600">
                      {formatSessionTime(item.started_at, "—")} – {formatSessionTime(item.ended_at, "running")}
                    </td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">
                      {formatSeconds(Number(item.actual_duration || 0))}
                    </td>
                    <td className="px-3 py-2.5 font-semibold" style={{ color }}>
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px]" style={{ background: `${color}14`, border: `1px solid ${color}33` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        {label} · {efficiency}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {pairs.length === 0 ? (
                        <span className="text-slate-400">Completed break</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {pairs.map((p, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
                              <span className="text-slate-400">{p.label}:</span>
                              <span className="font-semibold capitalize text-slate-700 break-words">{p.value}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );

    const dayTile = (key: string) => {
      const d = keyToDate(key);
      return (
        <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: "#eef3f8", border: `1px solid ${LINE}` }}>
          <span className="text-[13px] font-bold leading-none" style={{ color: NAVY }}>{String(d.getDate()).padStart(2, "0")}</span>
          <span className="text-[8px] font-semibold uppercase leading-none mt-1 text-slate-500">
            {d.toLocaleDateString("en-GB", { month: "short" })}
          </span>
        </div>
      );
    };

    const chevronBtn = (isOpen: boolean) => (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-lg border transition-all shrink-0 ${isOpen ? "text-white" : "border-slate-300 text-slate-500 bg-white"}`}
        style={isOpen ? { background: NAVY, borderColor: NAVY } : undefined}
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </span>
    );

    return (
      <div className="space-y-3">
        {/* ══ Hero + Toolbar ══ */}
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}>
          {/* Premium Hero Section */}
          <div
            className="relative px-6 py-5"
            style={{
              background: `radial-gradient(ellipse at 90% 10%, rgba(230,118,29,0.35) 0%, rgba(230,118,29,0) 50%), radial-gradient(ellipse at 10% 90%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 50%), ${BRAND_GRADIENT}`,
            }}
          >
            {/* Subtle decorative grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-5 min-w-0">
                <button
                  onClick={closeEmployeePage}
                  className="group flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 cursor-pointer active:scale-95 shrink-0 backdrop-blur-sm border border-white/10"
                  title="Back to list"
                >
                  <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-0.5 transition-transform" />
                </button>

                {/* Avatar with premium ring & status */}
                <div className="relative shrink-0">
                  <div
                    className="w-16 h-16 rounded-2xl text-white flex items-center justify-center font-bold text-[20px] tracking-wide"
                    style={{
                      background: `linear-gradient(135deg, ${ORANGE} 0%, #f59e4b 100%)`,
                      boxShadow: "0 0 0 4px rgba(255,255,255,0.15), 0 12px 28px -8px rgba(0,0,0,0.6)"
                    }}
                  >
                    {getInitials(selectedEmployee.employee_name)}
                  </div>
                  {/* Live status dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-[3px] border-[#0B3854] flex items-center justify-center" style={{ background: selectedEmployee.current_state === 'ACTIVE' || selectedEmployee.current_state === 'RUNNING' ? '#22c55e' : selectedEmployee.current_state === 'BREAK' ? ORANGE : '#94a3b8' }}>
                    {selectedEmployee.current_state === 'ACTIVE' || selectedEmployee.current_state === 'RUNNING' ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : null}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] leading-3 mb-1">Employee Activity Report</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[22px] font-bold text-white truncate leading-7 tracking-tight">{selectedEmployee.employee_name}</h1>
                    {getLiveStateBadge(selectedEmployee.current_state)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-1.5">
                    <span className="text-[11.5px] text-white/70 flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-white/50" />
                      {selectedEmployee.department || "General"}
                      <span className="text-white/30">·</span>
                      {selectedEmployee.role || "Agent"}
                    </span>
                    <span className="text-[11.5px] text-white/70 flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 text-white/50" />
                      {selectedEmployee.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Premium Download Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPdf || employeeBreaksLoading}
                className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-bold text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border border-white/10 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${ORANGE} 0%, #f59e4b 100%)`,
                  boxShadow: "0 8px 24px -8px rgba(230,118,29,0.9), inset 0 1px 0 rgba(255,255,255,0.2)"
                }}
                title="Download PDF report"
              >
                {downloadingPdf ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Toolbar: view tabs · table/chart toggle · quick ranges · date pickers */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-white border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                {viewTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleChangeReportView(tab.id)}
                    className={`rounded-lg px-4 py-1.5 text-[11.5px] font-bold transition-all cursor-pointer ${reportView === tab.id ? "text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
                    style={reportView === tab.id ? { background: BRAND_GRADIENT } : undefined}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Table / Chart switcher */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setDisplayMode("table")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${displayMode === "table" ? "text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
                  style={displayMode === "table" ? { background: BRAND_GRADIENT } : undefined}
                  title="Table view"
                >
                  <Table2 className="w-3.5 h-3.5" />
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode("chart")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${displayMode === "chart" ? "text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
                  style={displayMode === "chart" ? { background: BRAND_GRADIENT } : undefined}
                  title="Chart view"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Chart
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {presets.map((p) => {
                const active = isPresetActive(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`h-8 px-3 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer active:scale-95 ${active ? "text-[#B85A10]" : "text-slate-600 bg-white border-slate-200 hover:border-[#E6761D] hover:text-[#B85A10]"}`}
                    style={active ? { background: "rgba(230,118,29,0.10)", borderColor: "rgba(230,118,29,0.45)" } : undefined}
                  >
                    {p.label}
                  </button>
                );
              })}

              <div className="flex items-center h-8 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                <label className="flex items-center gap-1.5 px-2.5 h-full text-[10px] font-semibold text-slate-500 border-r border-slate-200">
                  From
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="bg-transparent border-none outline-none cursor-pointer font-sans text-[11px] text-slate-700 w-[104px]"
                  />
                </label>
                <label className="flex items-center gap-1.5 px-2.5 h-full text-[10px] font-semibold text-slate-500">
                  To
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    className="bg-transparent border-none outline-none cursor-pointer font-sans text-[11px] text-slate-700 w-[104px]"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-1.5 bg-slate-50 border-t border-slate-100">
            <span className="text-[10px] font-semibold text-slate-500">Showing data for</span>
            <span className="font-mono text-[11px] font-semibold" style={{ color: NAVY }}>{detailRangeLabel}</span>
          </div>
        </div>

        {/* ══ KPI cards ══ */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {kpis.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl px-3.5 py-3 bg-white"
                style={{ border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: card.bg }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                  </span>
                  <p className="text-[10.5px] font-semibold text-slate-500 leading-3.5">{card.label}</p>
                </div>
                <p className="mt-2 text-[22px] font-bold leading-6" style={{ color: card.color }}>{card.value}</p>
                <p className="mt-0.5 text-[10px] text-slate-400 font-mono">{card.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ══ Plain-language summary ══ */}
        {!employeeBreaksLoading && mergedDayRows.length > 0 && (
          <div
            className="flex items-start gap-3 rounded-2xl px-4 py-3"
            style={{ background: "linear-gradient(90deg, rgba(230,118,29,0.08), rgba(230,118,29,0.02))", border: "1px solid rgba(230,118,29,0.22)" }}
          >

            <p className="text-[12px] leading-5 text-slate-700">
              In this period <b style={{ color: NAVY }}>{firstName}</b> worked{" "}
              <b style={{ color: NAVY }}>{formatHM(totals.worked)}</b> across{" "}
              <b style={{ color: NAVY }}>{totals.activeDays}</b> active day{totals.activeDays === 1 ? "" : "s"}, of which{" "}
              <b style={{ color: "#047857" }}>{formatHM(totals.prod)}</b> was productive ({totals.prodPct}% of worked time).{" "}
              {totals.breakCount > 0 ? (
                <>
                  <b style={{ color: "#B85A10" }}>{totals.breakCount}</b> break{totals.breakCount === 1 ? "" : "s"} taken
                  {topBreak ? <>, most time spent on <b style={{ color: "#B85A10" }}>{topBreak[0]}</b> ({formatSeconds(topBreak[1].seconds)})</> : null}.
                </>
              ) : (
                <>No breaks were recorded.</>
              )}
            </p>
          </div>
        )}

        {/* ══ Break types (always visible) ══ */}
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100">
            <BarChart3 className="w-4 h-4" style={{ color: ORANGE }} />
            <h2 className="text-[12.5px] font-bold" style={{ color: NAVY }}>Break types taken</h2>
            <span className="text-[10.5px] text-slate-400">
              {totals.breakCount} break{totals.breakCount === 1 ? "" : "s"} · {formatSeconds(totalBreakTypeSeconds)}
            </span>
          </div>
          {breakTypeList.length === 0 ? (
            <div className="px-4 py-5 text-center text-[11px] text-slate-500">No breaks recorded for this period.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5 p-3.5">
              {breakTypeList.map(([type, s]) => {
                const color = getBreakColor(type);
                const share = totalBreakTypeSeconds ? Math.round((s.seconds / totalBreakTypeSeconds) * 100) : 0;
                return (
                  <div key={type} className="rounded-xl px-3 py-2.5" style={{ background: `${color}0d`, border: `1px solid ${color}30` }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-bold min-w-0" style={{ color }}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="truncate">{type}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">{share}%</span>
                    </div>
                    <p className="mt-1.5 font-mono text-[15px] font-bold text-slate-800">{formatSeconds(s.seconds)}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {s.count} break{s.count === 1 ? "" : "s"} · avg {formatSeconds(s.count ? s.seconds / s.count : 0)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══ Main report: Table or Chart ══ */}
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-white border-b border-slate-200">
            <div className="flex items-center gap-2">
              {displayMode === "table" ? (
                <CalendarDays className="w-4 h-4" style={{ color: NAVY }} />
              ) : (
                <LineChart className="w-4 h-4" style={{ color: NAVY }} />
              )}
              <h2 className="text-[13px] font-bold" style={{ color: NAVY }}>
                {displayMode === "table" ? reportTitle : `${reportTitle} · Chart`}
              </h2>
              <span className="text-[10.5px] font-semibold text-slate-400">
                {reportView === "daily"
                  ? `${mergedDayRows.length} day${mergedDayRows.length === 1 ? "" : "s"}`
                  : `${periodGroups.length} ${reportView === "weekly" ? "week" : "month"}${periodGroups.length === 1 ? "" : "s"} · ${mergedDayRows.length} day${mergedDayRows.length === 1 ? "" : "s"}`}
              </span>
            </div>

            {displayMode === "table" && (
              <button
                onClick={toggleAllDates}
                disabled={currentKeys.length === 0}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${allExpanded ? "rotate-180" : ""}`} />
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
            )}
          </div>

          {employeeBreaksLoading ? (
            <div className="p-10 text-center text-[11px] text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" style={{ color: ORANGE }} />
              Loading activity &amp; break details...
            </div>
          ) : mergedDayRows.length === 0 ? (
            <div className="p-10 text-center text-[11px] text-slate-500">
              No work activity or breaks found for this date range. Try a wider range.
            </div>
          ) : displayMode === "chart" ? (
            /* ───────────── CHART VIEW ───────────── */
            <div className="p-4">
              {/* Legend + helper strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-sm" style={{ background: CHART_WORKED }} />
                    Worked
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-sm" style={{ background: CHART_PRODUCTIVE }} />
                    Productive
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-sm" style={{ background: CHART_BREAK }} />
                    Break
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: ORANGE }} />
                    Peak productive
                  </span>
                </div>
                <span className="text-[10.5px] text-slate-400">
                  Hover a bar for exact values
                </span>
              </div>

              <div
                className="rounded-xl border border-slate-100 overflow-hidden"
                style={{ background: "linear-gradient(180deg, #fbfdff 0%, #f4f7fa 100%)" }}
              >
                <ReportBarChart data={chartData} height={360} />
              </div>

              {/* Compact summary below chart */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3">
                <div className="rounded-xl px-3 py-2.5 bg-[#eef3f8] border border-[#dbe4ee]">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Total worked</p>
                  <p className="mt-1 font-mono text-[16px] font-bold" style={{ color: NAVY }}>{formatCompact(totals.worked)}</p>
                </div>
                <div className="rounded-xl px-3 py-2.5 bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Productive</p>
                  <p className="mt-1 font-mono text-[16px] font-bold text-emerald-700">{formatCompact(totals.prod)}</p>
                </div>
                <div className="rounded-xl px-3 py-2.5 bg-[#fff7ed] border border-[#fed7aa]">
                  <p className="text-[10px] font-semibold text-[#B85A10] uppercase tracking-wide">Break</p>
                  <p className="mt-1 font-mono text-[16px] font-bold" style={{ color: "#B85A10" }}>{formatCompact(totals.brk)}</p>
                </div>
                <div className="rounded-xl px-3 py-2.5 bg-[#eef3f8] border border-[#dbe4ee]">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Productivity rate</p>
                  <p className="mt-1 font-mono text-[16px] font-bold" style={{ color: NAVY_SOFT }}>{totals.prodPct}%</p>
                </div>
              </div>
            </div>
          ) : reportView === "daily" ? (
            /* ───────────── DAILY TABLE ───────────── */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-[11px] border-collapse">
                <colgroup>
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "5%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#f4f7fa] text-slate-500" style={{ borderBottom: `1px solid ${LINE}` }}>
                    <th className={thBase}>Date</th>
                    <th className={thBase}>Started</th>
                    <th className={thBase}>Ended</th>
                    <th className={`${thBase} text-center`}>Worked</th>
                    <th className={`${thBase} text-center`}>Break</th>
                    <th className={`${thBase} text-center`}>Productive</th>
                    <th className={thBase}>Breaks taken</th>
                    <th className={thBase}>Status</th>
                    <th className={thBase}></th>
                  </tr>
                </thead>
                <tbody>
                  {mergedDayRows.map((row) => {
                    const isOpen = expandedDates.has(row.dateKey);
                    const daily = row.daily;
                    const isToday = row.dateKey === todayKey;
                    return (
                      <React.Fragment key={row.dateKey}>
                        <tr
                          className={`cursor-pointer transition-colors ${isOpen ? "bg-[#0B3854]/[0.04]" : "hover:bg-slate-50/70"}`}
                          style={{ borderTop: `1px solid ${V_LINE}` }}
                          onClick={() => toggleDate(row.dateKey)}
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              {dayTile(row.dateKey)}
                              <div>
                                <div className="font-mono font-semibold text-slate-800 text-[11px]">{row.dateLabel}</div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                  {row.weekday}
                                  {isToday && (
                                    <span className="rounded-full px-1.5 py-px text-[8.5px] font-bold text-white" style={{ background: ORANGE }}>Today</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-mono text-slate-600">{daily ? formatSessionTime(daily.started_at, "—") : "—"}</td>
                          <td className="px-3 py-3 font-mono">
                            {daily && daily.ended_at ? (
                              <span className="text-slate-600">{formatSessionTime(daily.ended_at)}</span>
                            ) : (
                              <span className="text-[10px] font-sans font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">Not ended</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center"><MetricPill value={formatSeconds(row.workedSec)} tone="slate" /></td>
                          <td className="px-3 py-3 text-center"><MetricPill value={formatSeconds(row.totalBreakSec)} tone="orange" /></td>
                          <td className="px-3 py-3 text-center"><MetricPill value={formatSeconds(row.productiveSec)} tone="green" /></td>
                          <td className="px-3 py-3"><BreakChips summary={row.typeSummary} /></td>
                          <td className="px-3 py-3">{getStatusBadge(row.status)}</td>
                          <td className="px-3 py-3 text-right">{chevronBtn(isOpen)}</td>
                        </tr>

                        {isOpen && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={9} className="px-4 pb-4 pt-2">
                              {row.breaks.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-4 text-center text-[11px] text-slate-500">
                                  No breaks recorded on this day.
                                </div>
                              ) : (
                                renderBreakDetailTable(row.breaks, row.breakSeconds)
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f4f7fa]" style={{ borderTop: `2px solid ${LINE}` }}>
                    <td className="px-3 py-3 text-[11px] font-bold" style={{ color: NAVY }} colSpan={3}>
                      Total · {mergedDayRows.length} day{mergedDayRows.length === 1 ? "" : "s"}
                    </td>
                    <td className="px-3 py-3 text-center"><MetricPill value={formatSeconds(totals.worked)} tone="slate" /></td>
                    <td className="px-3 py-3 text-center"><MetricPill value={formatSeconds(totals.brk)} tone="orange" /></td>
                    <td className="px-3 py-3 text-center"><MetricPill value={formatSeconds(totals.prod)} tone="green" /></td>
                    <td className="px-3 py-3 text-[10.5px] text-slate-500" colSpan={3}>
                      {totals.breakCount} break{totals.breakCount === 1 ? "" : "s"} · {totals.achieved} achieved · {totals.behind} behind
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            /* ───────────── WEEKLY / MONTHLY TABLE ───────────── */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-[11px] border-collapse">
                <colgroup>
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "5%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#f4f7fa] text-slate-500" style={{ borderBottom: `1px solid ${LINE}` }}>
                    <th className={thBase}>{reportView === "weekly" ? "Week" : "Month"}</th>
                    <th className={`${thBase} text-center`}>Active days</th>
                    <th className={`${thBase} text-center`}>Worked</th>
                    <th className={`${thBase} text-center`}>Break</th>
                    <th className={`${thBase} text-center`}>Productive</th>
                    <th className={`${thBase} text-center`}>Avg / day</th>
                    <th className={thBase}>Target days</th>
                    <th className={thBase}>Break types</th>
                    <th className={thBase}></th>
                  </tr>
                </thead>
                <tbody>
                  {periodGroups.map((g) => {
                    const isOpen = expandedDates.has(g.key);
                    const avg = g.activeDays ? g.productiveSec / g.activeDays : 0;
                    return (
                      <React.Fragment key={g.key}>
                        <tr
                          className={`cursor-pointer transition-colors ${isOpen ? "bg-[#0B3854]/[0.04]" : "hover:bg-slate-50/70"}`}
                          style={{ borderTop: `1px solid ${V_LINE}` }}
                          onClick={() => toggleDate(g.key)}
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eef3f8", border: `1px solid ${LINE}` }}>
                                <CalendarDays className="w-4 h-4" style={{ color: NAVY }} />
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-[12px] leading-4" style={{ color: NAVY }}>{g.label}</div>
                                <div className="text-[10px] text-slate-400">{g.sublabel || `${g.days.length} day${g.days.length === 1 ? "" : "s"} logged`}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="font-bold text-[13px] text-slate-800">{g.activeDays}</div>
                            <div className="text-[9.5px] text-slate-400">of {g.days.length} day{g.days.length === 1 ? "" : "s"}</div>
                          </td>
                          <td className="px-3 py-3 text-center"><MetricPill value={formatHM(g.workedSec)} tone="slate" /></td>
                          <td className="px-3 py-3 text-center"><MetricPill value={formatHM(g.breakSec)} tone="orange" /></td>
                          <td className="px-3 py-3 text-center"><MetricPill value={formatHM(g.productiveSec)} tone="green" /></td>
                          <td className="px-3 py-3 text-center"><MetricPill value={formatHM(avg)} tone="green" /></td>
                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" /> {g.achievedDays} achieved
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                                <AlertCircle className="w-3 h-3" /> {g.behindDays} behind
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3"><BreakChips summary={g.typeSummary} max={2} /></td>
                          <td className="px-3 py-3 text-right">{chevronBtn(isOpen)}</td>
                        </tr>

                        {isOpen && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={9} className="px-4 pb-4 pt-2">
                              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden" style={{ boxShadow: CARD_SHADOW }}>
                                <div className="flex items-center gap-2 px-3.5 py-2 bg-[#f4f7fa] border-b border-slate-200">
                                  <CalendarDays className="w-3.5 h-3.5" style={{ color: NAVY }} />
                                  <span className="text-[11px] font-bold" style={{ color: NAVY }}>Day-wise breakdown · {g.label}</span>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full min-w-[820px] text-left text-[11px] border-collapse">
                                    <thead>
                                      <tr className="bg-white text-slate-500" style={{ borderBottom: `1px solid ${V_LINE}` }}>
                                        <th className={thBase}>Date</th>
                                        <th className={`${thBase} text-center`}>Worked</th>
                                        <th className={`${thBase} text-center`}>Break</th>
                                        <th className={`${thBase} text-center`}>Productive</th>
                                        <th className={thBase}>Breaks taken</th>
                                        <th className={thBase}>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {g.days.map((d) => (
                                        <tr key={d.dateKey} className="hover:bg-slate-50/60" style={{ borderTop: `1px solid ${V_LINE}` }}>
                                          <td className="px-3 py-2.5">
                                            <span className="font-mono font-semibold text-slate-800">{d.dateLabel}</span>
                                            <span className="ml-2 text-[10px] text-slate-400">{d.weekday}</span>
                                          </td>
                                          <td className="px-3 py-2.5 text-center"><MetricPill value={formatSeconds(d.workedSec)} tone="slate" /></td>
                                          <td className="px-3 py-2.5 text-center"><MetricPill value={formatSeconds(d.totalBreakSec)} tone="orange" /></td>
                                          <td className="px-3 py-2.5 text-center"><MetricPill value={formatSeconds(d.productiveSec)} tone="green" /></td>
                                          <td className="px-3 py-2.5"><BreakChips summary={d.typeSummary} /></td>
                                          <td className="px-3 py-2.5">{getStatusBadge(d.status)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f4f7fa]" style={{ borderTop: `2px solid ${LINE}` }}>
                    <td className="px-3 py-3 text-[11px] font-bold" style={{ color: NAVY }}>Grand total</td>
                    <td className="px-3 py-3 text-center font-bold text-slate-800">{totals.activeDays}</td>
                    <td className="px-3 py-3 text-center"><MetricPill value={formatHM(totals.worked)} tone="slate" /></td>
                    <td className="px-3 py-3 text-center"><MetricPill value={formatHM(totals.brk)} tone="orange" /></td>
                    <td className="px-3 py-3 text-center"><MetricPill value={formatHM(totals.prod)} tone="green" /></td>
                    <td className="px-3 py-3 text-center"><MetricPill value={formatHM(totals.avgProd)} tone="green" /></td>
                    <td className="px-3 py-3 text-[10.5px] text-slate-500" colSpan={3}>
                      {totals.achieved} achieved · {totals.behind} behind
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: MAIN LIST VIEW
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px rounded-lg overflow-hidden" style={{ background: LINE, border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white relative flex items-center gap-2.5 px-3 py-2.5">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.pulse ? "animate-pulse" : ""}`} style={{ background: `${m.tint}1a` }}>
                <Icon className="w-4 h-4" style={{ color: m.tint }} />
              </span>
              <div className="min-w-0">
                <p className="text-[10.5px] font-medium text-slate-500 leading-4 truncate">{m.label}</p>
                <p className={`font-bold leading-5 truncate ${m.mono ? "text-[15px] font-mono" : "text-[19px]"}`} style={{ color: NAVY }}>
                  {m.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl flex flex-col" style={{ border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW, height: "calc(100vh - 130px)" }}>

        <div className="px-4 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[12px] font-bold text-slate-700">All</span>
              <span className="text-[12px] font-bold text-[#E6761D]">{totalRecords}</span>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => onActiveViewChange?.("agent_execution")}
                className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap transition-all ${activeView === "agent_execution" ? "text-white shadow-sm" : "text-slate-700 hover:bg-white"}`}
                style={activeView === "agent_execution" ? { background: BRAND_GRADIENT } : undefined}
              >
                Agent Lead Execution
              </button>
              {[
                ["daily_work_tracker", "Daily Work Tracker"],
                ["user_breakdown", "Lead Execution Breakdown"],
                ["activity_logs", "Activity Feed"],
              ].map(([view, label]) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => onActiveViewChange?.(view as ActivityView)}
                  className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap transition-all ${activeView === view ? "text-white shadow-sm" : "text-slate-700 hover:bg-white"}`}
                  style={activeView === view ? { background: BRAND_GRADIENT } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative group">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E6761D] transition-colors" />
              <input
                type="text"
                placeholder="Global search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-52 h-9 pl-9 pr-3 text-[11.5px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] transition-all"
              />
            </div>

            <div className="flex items-center h-9 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
              <div className="flex items-center gap-1.5 px-2.5 h-full text-[11px] font-semibold text-slate-600 border-r border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer font-sans text-[11px] w-[100px]" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 h-full text-[11px] font-semibold text-slate-600">
                <span className="text-slate-400 text-[10px]">to</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer font-sans text-[11px] w-[100px]" />
              </div>
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(""); setToDate(""); setSelectedEmployeeId(null); }}
                className="flex items-center justify-center h-9 px-3 rounded-lg text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              onClick={() => setBreakMasterOpen(true)}
              className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-[11px] font-semibold bg-[#E6761D]/10 hover:bg-[#E6761D]/20 text-[#B85A10] border border-[#E6761D]/30 transition-all cursor-pointer active:scale-95"
              title="Configure break types"
            >
              <Coffee className="w-3.5 h-3.5" style={{ color: ORANGE }} />
              Break Types
            </button>

            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-70"
              style={{ background: BRAND_GRADIENT, boxShadow: "0 3px 10px -4px rgba(11,56,84,0.55)" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {selectedEmployeeIds.size > 0 && (
          <div
            className="px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0"
            style={{ background: "linear-gradient(90deg, rgba(230,118,29,0.10), rgba(230,118,29,0.02))", borderBottom: `1px solid ${LINE}` }}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: NAVY }}>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#E6761D] text-white text-[10px] font-bold">
                {selectedEmployeeIds.size}
              </span>
              employee{selectedEmployeeIds.size === 1 ? "" : "s"} selected
              <button
                onClick={toggleSelectAllFiltered}
                className="ml-2 text-[10.5px] font-semibold text-[#B85A10] hover:text-[#8a3f08] underline-offset-2 hover:underline"
              >
                {filteredEmployees.every((e) => selectedEmployeeIds.has(e.employee_id)) ? "Unselect all filtered" : "Select all filtered"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="h-7 px-2.5 rounded-md text-[10.5px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Clear selection
              </button>
              <button
                onClick={() => setBulkDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[10.5px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3 h-3" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-2 bg-white z-20">
              <RefreshCw className="w-5 h-5 animate-spin" style={{ color: ORANGE }} />
              <p className="text-[11px] font-medium">Fetching real-time work updates...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-400 space-y-1 bg-white z-20">
              <Users className="w-8 h-8 text-slate-300" />
              <p className="text-[13px] font-semibold text-slate-600">No Employees Found</p>
              <p className="text-[11px] text-slate-400">Try adjusting search or date range.</p>
            </div>
          ) : (
            <table className="w-full min-w-[1160px] table-fixed text-left border-collapse">
              <colgroup>
                <col style={{ width: "40px" }} />
                <col style={{ width: "19%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>

              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="text-white/90 font-semibold uppercase tracking-wide text-[9.5px]" style={{ height: HEAD_H, background: BRAND_GRADIENT }}>
                  <th className="px-2 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>
                    <button
                      type="button"
                      onClick={handleToggleSelectPage}
                      title={isAllPageSelected ? "Unselect page" : "Select page"}
                      className="inline-flex items-center justify-center w-4 h-4 rounded-[4px] border transition-all cursor-pointer"
                      style={{
                        background: isAllPageSelected ? ORANGE : "transparent",
                        borderColor: isAllPageSelected ? ORANGE : "rgba(255,255,255,0.5)",
                        color: "#fff",
                      }}
                    >
                      {isAllPageSelected ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : isSomePageSelected ? (
                        <MinusSquare className="w-3 h-3" />
                      ) : null}
                    </button>
                  </th>
                  <th className="px-4 text-left" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Employee Details</th>
                  <th className="px-4 text-left" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Department / Role</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Target</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Worked</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Break</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Productive</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Live State</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Daily Status</th>
                  <th className="px-4 text-right">Action</th>
                </tr>
                <tr className="bg-white border-b border-slate-200" style={{ height: SEARCH_H }}>
                  <th className="px-2" style={{ borderRight: `1px solid ${V_LINE}` }} />
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="Search employee..." value={colSearches.name} onChange={(e) => handleColSearch("name", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="Search dept..." value={colSearches.dept} onChange={(e) => handleColSearch("dept", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="e.g. 08:00" value={colSearches.target} onChange={(e) => handleColSearch("target", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="e.g. 04:00" value={colSearches.worked} onChange={(e) => handleColSearch("worked", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="e.g. 01:00" value={colSearches.break} onChange={(e) => handleColSearch("break", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="e.g. 03:00" value={colSearches.productive} onChange={(e) => handleColSearch("productive", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="Search state..." value={colSearches.state} onChange={(e) => handleColSearch("state", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <select
                      value={colSearches.status}
                      onChange={(e) => handleColSearch("status", e.target.value)}
                      className="w-full h-7 px-1.5 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </th>
                  <th className="px-3 py-1.5"></th>
                </tr>
              </thead>

              <tbody className="font-medium text-slate-700">
                {pagedEmployees.map((emp, i) => {
                  const isSelected = selectedEmployeeIds.has(emp.employee_id);
                  return (
                    <tr
                      key={emp.employee_id}
                      className={`group transition-colors cursor-pointer ${isSelected ? "bg-[#E6761D]/[0.06]" : i % 2 === 1 ? "bg-slate-50/50" : "bg-white"} hover:bg-[#0B3854]/[0.03]`}
                      style={{ height: ROW_H, borderBottom: `1px solid #eef2f6` }}
                      onClick={() => openEmployeeDetails(emp)}
                    >
                      <td className="px-2 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleSelectEmployee(emp.employee_id); }}
                          title={isSelected ? "Unselect" : "Select"}
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-[4px] border transition-all cursor-pointer ${isSelected ? "bg-[#E6761D] border-[#E6761D] text-white" : "border-slate-300 text-transparent hover:border-[#E6761D]"}`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-4" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm" style={{ background: BRAND_GRADIENT, boxShadow: `0 0 0 2px ${ORANGE}33` }}>
                            {getInitials(emp.employee_name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[12px] leading-4 truncate text-slate-800 group-hover:text-[#0B3854] transition-colors">{emp.employee_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono leading-3.5 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <div className="font-semibold text-slate-800 text-[11.5px] leading-4 truncate">{emp.department || "General"}</div>
                        <div className="text-[10px] text-slate-400 capitalize leading-3.5 truncate">{emp.role || "Agent"}</div>
                      </td>
                      <td className="px-4 text-center font-mono font-semibold" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10.5px] bg-[#0B3854]/[0.07] text-[#0B3854] border border-[#0B3854]/15 min-w-[64px]">{emp.target || "08:00:00"}</span>
                      </td>
                      <td className="px-4 text-center font-mono font-semibold" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10.5px] bg-slate-100 text-slate-800 min-w-[64px]">{emp.worked || "00:00:00"}</span>
                      </td>
                      <td className="px-4 text-center font-mono font-semibold" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10.5px] bg-[#E6761D]/10 text-[#B85A10] border border-[#E6761D]/20 min-w-[64px]">{emp.break_time || "00:00:00"}</span>
                      </td>
                      <td className="px-4 text-center font-mono font-bold" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10.5px] bg-emerald-50 text-emerald-700 border border-emerald-100 min-w-[64px]">{emp.productive || "00:00:00"}</span>
                      </td>
                      <td className="px-4 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>{getLiveStateBadge(emp.current_state)}</td>
                      <td className="px-4 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>{getStatusBadge(emp.status)}</td>
                      <td className="px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEmployeeDetails(emp); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10.5px] font-semibold text-[#0B3854] bg-white border border-slate-200 hover:border-[#0B3854] hover:bg-[#0B3854]/5 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="View employee details"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); setTargetEmp(emp); setNewTargetHours(emp.target_seconds ? emp.target_seconds / 3600 : 8); setTargetModalOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10.5px] font-semibold text-[#0B3854] bg-white border border-slate-200 hover:border-[#E6761D] hover:text-[#B85A10] hover:bg-[#E6761D]/5 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Set Daily Target"
                          >
                            <Edit className="w-3 h-3" /> Target
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteEmp(emp); setDeleteModalOpen(true); }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-rose-600 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Delete employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {Array.from({ length: fillerCount }).map((_, i) => (
                  <tr key={`filler-${i}`} style={{ height: ROW_H }}>
                    <td colSpan={10} />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/80 shrink-0" style={{ borderTop: `1px solid ${LINE}` }}>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>
              Showing <span className="font-semibold" style={{ color: NAVY }}>{showingFrom}–{showingTo}</span> of <span className="font-semibold" style={{ color: NAVY }}>{totalRecords}</span>
            </span>
            <span className="flex items-center gap-2">
              Rows per page
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-7 px-2 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] cursor-pointer shadow-sm">
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage <= 1} className={`${pageBtn} border border-slate-200 bg-white text-slate-600 hover:border-[#E6761D] hover:text-[#B85A10] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed shadow-sm`} title="Previous page">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {getPageNumbers(totalPages, safePage).map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-1 text-[11px] text-slate-400 font-semibold">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p)} className={`${pageBtn} ${p === safePage ? "text-white shadow-md" : "border border-slate-200 bg-white text-slate-600 hover:border-[#E6761D] hover:text-[#B85A10] shadow-sm"}`} style={p === safePage ? { background: ORANGE, boxShadow: "0 3px 10px -3px rgba(230,118,29,0.65)" } : undefined}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages} className={`${pageBtn} border border-slate-200 bg-white text-slate-600 hover:border-[#E6761D] hover:text-[#B85A10] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed shadow-sm`} title="Next page">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {targetModalOpen && targetEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn" style={{ background: "rgba(4,24,38,0.70)" }}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden" style={{ border: `1px solid ${LINE}`, boxShadow: "0 30px 70px -20px rgba(4,24,38,0.6)" }}>
            <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${ORANGE}, #f59e4b, transparent)` }} />
            <div className="flex items-center justify-between px-4 py-2.5" style={{ background: BRAND_GRADIENT }}>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(230,118,29,0.20)", border: "1px solid rgba(230,118,29,0.45)" }}>
                  <Target className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                </span>
                <h3 className="font-semibold text-white text-[13px]">Set Daily Target</h3>
              </div>
              <button onClick={() => setTargetModalOpen(false)} className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg px-3 py-2" style={{ background: "#eef3f8", border: `1px solid ${LINE}` }}>
                  <p className="text-[10px] font-medium text-slate-500">Employee</p>
                  <p className="text-[12px] font-semibold mt-0.5 truncate" style={{ color: NAVY }}>{targetEmp.employee_name}</p>
                </div>
                <div className="rounded-lg px-3 py-2" style={{ background: "#eef3f8", border: `1px solid ${LINE}` }}>
                  <p className="text-[10px] font-medium text-slate-500">Target Date</p>
                  <p className="text-[12px] font-mono font-semibold mt-0.5" style={{ color: ORANGE }}>{formatDateDDMMYYYY(toDate || fromDate || new Date().toISOString().split("T")[0])}</p>
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">Target Hours (Default 8 Hours):</label>
                <input type="number" step="0.5" min="1" max="24" value={newTargetHours} onChange={(e) => setNewTargetHours(parseFloat(e.target.value) || 8)} className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6761D]/30 focus:border-[#E6761D]" />
                <p className="text-[10.5px] text-slate-400 mt-1">Equivalents: {Math.round(newTargetHours * 3600)} seconds ({newTargetHours} Hours)</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-slate-50/70" style={{ borderTop: `1px solid ${LINE}` }}>
              <button onClick={() => setTargetModalOpen(false)} className="px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button onClick={handleSaveTarget} disabled={settingTarget} className="px-4 py-1.5 rounded-lg text-[11.5px] font-semibold text-white cursor-pointer active:scale-95 disabled:opacity-70" style={{ background: ORANGE, boxShadow: "0 4px 12px -4px rgba(230,118,29,0.7)" }}>
                {settingTarget ? "Saving..." : "Save Target"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && deleteEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,24,38,0.70)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden" style={{ border: `1px solid ${LINE}`, boxShadow: "0 30px 70px -20px rgba(4,24,38,0.6)" }}>
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border-b border-rose-100">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-rose-900 text-[13px]">Delete Employee</h3>
                <p className="text-[10px] text-rose-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[12px] text-slate-600">
                Are you sure you want to delete <span className="font-bold text-slate-800">{deleteEmp.employee_name}</span>? All associated data will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-slate-50/70" style={{ borderTop: `1px solid ${LINE}` }}>
              <button onClick={() => { setDeleteModalOpen(false); setDeleteEmp(null); }} className="px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button onClick={handleDeleteEmployee} disabled={deleting} className="px-4 py-1.5 rounded-lg text-[11.5px] font-semibold text-white cursor-pointer active:scale-95 disabled:opacity-70 bg-rose-600 hover:bg-rose-700">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,24,38,0.70)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden" style={{ border: `1px solid ${LINE}`, boxShadow: "0 30px 70px -20px rgba(4,24,38,0.6)" }}>
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border-b border-rose-100">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-rose-900 text-[13px]">Delete Selected Employees</h3>
                <p className="text-[10px] text-rose-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[12px] text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-800">
                  {selectedEmployeeIds.size} employee{selectedEmployeeIds.size === 1 ? "" : "s"}
                </span>
                ? All associated data will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-slate-50/70" style={{ borderTop: `1px solid ${LINE}` }}>
              <button onClick={() => setBulkDeleteModalOpen(false)} className="px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button onClick={handleBulkDelete} disabled={bulkDeleting} className="px-4 py-1.5 rounded-lg text-[11.5px] font-semibold text-white cursor-pointer active:scale-95 disabled:opacity-70 bg-rose-600 hover:bg-rose-700">
                {bulkDeleting ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {breakMasterOpen && (
        <AdminBreakTypesMasterModal isOpen={breakMasterOpen} onClose={() => setBreakMasterOpen(false)} />
      )}
    </div>
  );
};

export default AdminDailyWorkTracker;