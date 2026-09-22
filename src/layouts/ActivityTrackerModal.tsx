import React, { useEffect, useMemo, useState, useRef } from "react";
import {
    X,
    Coffee,
    Play,
    Pause,
    Square,
    Timer,
    ListChecks,
    User,
    Building2,
    CalendarDays,
    AlertTriangle,
    ShieldCheck,
    Laptop,
    PauseCircle,
    Activity as ActivityIcon,
    Target,
    Clock,
    TrendingUp,
    Award,
    Volume2,
    VolumeX,
} from "lucide-react";
import BreakTypesModal from "./BreakTypeModal";
import { useActivityTracker } from "../context/ActivityTrackerContext";
import EmployeeDailyUpdateView from "../components/activity/EmployeeDailyUpdateView";
import { workSessionAPI } from "@/lib/api";

// ── ESALE console tokens (UNCHANGED) ───────────────────
const BEZEL = "#0B3854";
const BEZEL_SOFT = "#11507A";
const BEZEL_DEEP = "#082C43";
const BEZEL_LINE = "rgba(255,255,255,0.10)";
const SCREEN = "#eef3f8";
const MODULE = "#ffffff";
const MODULE_LINE = "#dbe4ee";
const ACCENT = "#ff7a1a";
const ACTIVE = "#16a34a";
const IDLE = "#8b5cf6";
const BREAKC = "#0ea5e9";
const WARN = "#eab308";
const DANGER = "#ef4444";
const TEXT = "#0f2333";
const MUTED = "#5f7386";
const CREDIT = "#10b981";
const HALFDAY = "#f59e0b";

const MONO =
    "'IBM Plex Mono','SF Mono',ui-monospace,Menlo,Consolas,monospace";

const CARD_SHADOW = "0 1px 2px rgba(11,56,84,0.06), 0 8px 24px -12px rgba(11,56,84,0.18)";

const CARD_STYLE: React.CSSProperties = {
    background: MODULE,
    border: `1px solid ${MODULE_LINE}`,
    boxShadow: CARD_SHADOW,
};

// ── Live-motion keyframes (scoped with att- prefix) ────
const LIVE_CSS = `
@keyframes att-wave { 0%,100% { transform: scaleY(.18); } 50% { transform: scaleY(1); } }
@keyframes att-blink { 0%,100% { opacity: 1; } 50% { opacity: .2; } }
@keyframes att-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(220%); } }
@keyframes att-breathe { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
.att-shimmer::after {
    content: ""; position: absolute; inset: 0; width: 45%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
    animation: att-shimmer 2.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
    .att-wave-bar, .att-colon, .att-shimmer::after, .att-breathe { animation: none !important; }
}
`;

type BreakDetails = {
    meetingNotes?: string;
    meetingPurpose?: string;
    [key: string]: any;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    sessionTime?: string;
    workTime?: string;
    isOnBreak?: boolean;
    onStartBreak?: (breakType: string, breakDetails: BreakDetails) => void;
    onEndBreak?: () => void;
    loginTime?: number | null;
    employeeName?: string;
    employeeId?: string;
    department?: string;
    avatarUrl?: string;
    expectedHours?: number;
    breakLimitMinutes?: number;
    expectedWorkHours?: number;
    halfDayThresholdHours?: number;
};

const toSeconds = (value?: string): number => {
    if (!value) return 0;
    const parts = value.split(":").map((p) => parseInt(p, 10));
    if (parts.some((p) => Number.isNaN(p))) return 0;
    return parts.reduceRight((acc, p, i, arr) => acc + p * Math.pow(60, arr.length - 1 - i), 0);
};

const formatDuration = (totalSeconds: number): string => {
    const s = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h <= 0) return `${m}m`;
    if (m <= 0) return `${h}h`;
    return `${h}h ${m}m`;
};

const formatCredit = (totalSeconds: number): string => {
    const s = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
};

const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
};

const getInitials = (name: string) =>
    name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

const formatBreakDetails = (detailsStr: string) => {
    if (!detailsStr || detailsStr === "—") return null;

    let parsed: any = null;
    try {
        parsed = typeof detailsStr === 'string' ? JSON.parse(detailsStr) : detailsStr;
    } catch (e) {
        return <span className="text-[10.5px]" style={{ color: MUTED }}>{detailsStr}</span>;
    }

    const entries = Object.entries(parsed).filter(([_, v]) => v !== "" && v !== null && v !== undefined);

    if (entries.length === 0) return null;

    const labelMap: Record<string, string> = {
        clientName: "Client",
        property: "Property",
        meetingNotes: "Notes",
        customDuration: "Duration",
        duration: "Duration",
        priority: "Priority",
        meetingPurpose: "Purpose",
        meetingWith: "With",
        meetingType: "Type",
    };

    return (
        <div className="flex flex-wrap gap-1 mt-0.5">
            {entries.map(([key, value]) => {
                if (key === 'customDuration' && value === detailsStr) return null;

                const label = labelMap[key] || key;
                const val = String(value);

                return (
                    <span
                        key={key}
                        className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-md text-[9.5px] font-medium"
                        style={{
                            background: hexToRgba(BEZEL, 0.05),
                            color: MUTED,
                            border: `1px solid ${MODULE_LINE}`
                        }}
                    >
                        <span className="font-semibold" style={{ color: TEXT }}>{label}:</span>
                        <span className="truncate max-w-[110px]">{val}</span>
                    </span>
                );
            })}
        </div>
    );
};

// ── Small building blocks ──────────────────────────────

const LiveDot: React.FC<{ color: string; live?: boolean }> = ({ color, live = false }) => (
    <span className="relative flex w-2 h-2 shrink-0">
        {live && (
            <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-70" style={{ background: color }} />
        )}
        <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: color }} />
    </span>
);

const LiveWave: React.FC<{ active: boolean }> = ({ active }) => (
    <div className="flex items-end gap-[3px] h-7" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
            <span
                key={i}
                className="att-wave-bar w-[3px] h-full rounded-full origin-bottom"
                style={{
                    background: ACCENT,
                    opacity: active ? 0.35 + (i / 22) * 0.65 : 0.22,
                    transform: active ? undefined : "scaleY(0.18)",
                    animation: active
                        ? `att-wave ${(0.9 + (i % 7) * 0.16).toFixed(2)}s ease-in-out ${((i * 0.07) % 1).toFixed(2)}s infinite`
                        : "none",
                    transition: "opacity 0.4s ease",
                }}
            />
        ))}
    </div>
);

const BudgetBar: React.FC<{ pct: number; color: string; overColor?: string; over?: boolean; live?: boolean }> = ({
    pct,
    color,
    overColor = DANGER,
    over = false,
    live = false,
}) => (
    <div className="h-[7px] w-full rounded-full overflow-hidden" style={{ background: hexToRgba(BEZEL, 0.09) }}>
        <div
            className={`h-full rounded-full relative overflow-hidden ${live && !over ? "att-shimmer" : ""}`}
            style={{
                width: `${Math.min(100, Math.max(0, pct))}%`,
                background: over ? overColor : color,
                transition: "width 0.6s ease",
            }}
        />
    </div>
);

const StatTile: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    accent: string;
    pct?: number;
    pctLabel?: string;
    live?: boolean;
}> = ({ icon, label, value, accent, pct, pctLabel, live }) => (
    <div className="rounded-xl px-2.5 py-2 flex flex-col justify-between gap-1.5 min-w-0" style={CARD_STYLE}>
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: hexToRgba(accent, 0.12) }}>
                    {icon}
                </span>
                <p className="text-[10.5px] font-semibold truncate" style={{ color: MUTED }}>{label}</p>
            </div>
            {pctLabel && (
                <span className="text-[10px] font-bold shrink-0" style={{ color: accent, fontFamily: MONO }}>{pctLabel}</span>
            )}
        </div>
        <div>
            <p className="text-[16px] font-bold leading-none" style={{ fontFamily: MONO, color: TEXT }}>{value}</p>
            <div className="mt-1.5 h-[3px] w-full rounded-full overflow-hidden" style={{ background: hexToRgba(accent, 0.12) }}>
                <div
                    className={`h-full rounded-full relative overflow-hidden ${live ? "att-shimmer" : ""}`}
                    style={{ width: `${Math.min(100, Math.max(0, pct ?? 0))}%`, background: accent, transition: "width 0.6s ease" }}
                />
            </div>
        </div>
    </div>
);

const IconChip: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
    <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: hexToRgba(color, 0.14) }}>
        {children}
    </span>
);

const MiniStat: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = TEXT }) => (
    <div className="rounded-lg px-2 py-1.5 min-w-0" style={{ background: hexToRgba(BEZEL, 0.04), border: `1px solid ${MODULE_LINE}` }}>
        <p className="text-[9.5px] font-medium truncate" style={{ color: MUTED }}>{label}</p>
        <p className="text-[12px] font-bold leading-none mt-1 truncate" style={{ fontFamily: MONO, color }}>{value}</p>
    </div>
);

// ── Audio helper: fade volume smoothly ─────────────────
const fadeAudio = (
    audio: HTMLAudioElement,
    to: number,
    duration = 500,
    onDone?: () => void
) => {
    const from = audio.volume;
    const start = performance.now();
    const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const v = from + (to - from) * t;
        audio.volume = Math.max(0, Math.min(1, v));
        if (t < 1) {
            requestAnimationFrame(step);
        } else if (onDone) {
            onDone();
        }
    };
    requestAnimationFrame(step);
};

const ActivityTrackerModal: React.FC<Props> = ({
    isOpen,
    onClose,
    loginTime,
    employeeName = "Employee",
    employeeId,
    department = "Unassigned",
    avatarUrl,
    expectedHours = 8,
    breakLimitMinutes = 60,
    expectedWorkHours = 7,
    halfDayThresholdHours = 4,
}) => {
    const {
        session,
        activeBreak,
        currentState,
        sessionTimeFormatted,
        workTimeFormatted,
        idleTimeFormatted,
        breakTimeFormatted,
        recentActivities,
        breakHistory,
        startSession,
        startBreak,
        endBreak,
        triggerLogoutModal,
    } = useActivityTracker();

    const [isBreakTypesOpen, setIsBreakTypesOpen] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<"tracker" | "daily_updates">("tracker");
    const today = new Date().toISOString().split("T")[0];
    const [breakFromDate, setBreakFromDate] = useState(today);
    const [breakToDate, setBreakToDate] = useState(today);
    const [rangeBreaks, setRangeBreaks] = useState<any[]>([]);

    // ── 🔊 Background tracking music ───────────────────
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const TARGET_VOLUME = 0.35;

    // Initialize audio once on mount
    useEffect(() => {
        const audio = new Audio("/background.mp3");
        audio.loop = true;
        audio.volume = 0; // start silent; fade in when playing
        audio.preload = "auto";
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = "";
            audioRef.current = null;
        };
    }, []);

    const [nowTick, setNowTick] = useState(() => new Date());
    useEffect(() => {
        if (!isOpen) return;
        const id = setInterval(() => setNowTick(new Date()), 1000);
        return () => clearInterval(id);
    }, [isOpen]);
    const liveClock = nowTick.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

    const composition = useMemo(() => {
        const active = toSeconds(workTimeFormatted);
        const idle = toSeconds(idleTimeFormatted);
        const brk = toSeconds(breakTimeFormatted);
        const total = active + idle + brk;
        const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
        return {
            active,
            idle,
            brk,
            total,
            activePct: pct(active),
            idlePct: pct(idle),
            breakPct: pct(brk),
        };
    }, [workTimeFormatted, idleTimeFormatted, breakTimeFormatted]);

    const R = 36;
    const CIRC = 2 * Math.PI * R;
    const ring = useMemo(() => {
        const segs = [
            { color: ACCENT, val: composition.active },
            { color: BREAKC, val: composition.brk },
            { color: IDLE, val: composition.idle },
        ];
        if (composition.total <= 0) return [{ color: MODULE_LINE, len: CIRC, offset: 0 }];
        const GAP = 2;
        let cursor = 0;
        return segs
            .filter((s) => s.val > 0)
            .map((s) => {
                const len = Math.max((s.val / composition.total) * CIRC - GAP, 0);
                const seg = { color: s.color, len, offset: -cursor };
                cursor += (s.val / composition.total) * CIRC;
                return seg;
            });
    }, [composition]);

    const isSessionActive = session !== null && currentState !== "COMPLETED";
    const isOnBreak = currentState === "BREAK" || activeBreak !== null;
    const isWorking = isSessionActive && !isOnBreak && currentState !== "IDLE" && currentState !== "ACTIVITY_CHECK";

    // ── 🔊 Play / pause background music based on state ─
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const shouldPlay = isWorking && isOpen && !isMuted;

        if (shouldPlay) {
            // If paused or ended, restart at 0 volume and fade in
            if (audio.paused) {
                audio.volume = 0;
                audio.play()
                    .then(() => fadeAudio(audio, TARGET_VOLUME, 600))
                    .catch((err) => {
                        // Autoplay was blocked (user hasn't interacted yet).
                        // This is expected on first render before any click.
                        console.warn("Tracking audio blocked by browser:", err?.name);
                    });
            } else {
                // Already playing — just ensure target volume
                fadeAudio(audio, TARGET_VOLUME, 400);
            }
        } else {
            // Fade out then pause
            if (!audio.paused) {
                fadeAudio(audio, 0, 400, () => {
                    // Only pause if still not supposed to play
                    if (audioRef.current === audio) audio.pause();
                });
            } else {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }, [isWorking, isOpen, isMuted]);

    // Stop audio if modal closes entirely
    useEffect(() => {
        if (!isOpen) {
            const audio = audioRef.current;
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }, [isOpen]);

    const handleSelectBreakFromModal = (breakType: string, details: any) => {
        startBreak(breakType, details.duration, details);
        setIsBreakTypesOpen(false);
    };

    const getStatusLabel = () => {
        if (!isSessionActive) return "Stopped";
        if (currentState === "BREAK") return "On break";
        if (currentState === "IDLE") return "Idle";
        if (currentState === "ACTIVITY_CHECK") return "Verification required";
        return "Live session";
    };

    const getStatusColor = () => {
        if (!isSessionActive) return DANGER;
        if (currentState === "BREAK") return ACCENT;
        if (currentState === "IDLE") return IDLE;
        if (currentState === "ACTIVITY_CHECK") return WARN;
        return ACTIVE;
    };

    const statusColor = getStatusColor();

    const workedSeconds = toSeconds(workTimeFormatted);
    const expectedSeconds = expectedHours * 3600;
    const workPct = expectedSeconds > 0 ? (workedSeconds / expectedSeconds) * 100 : 0;
    const overtimeSeconds = Math.max(0, workedSeconds - expectedSeconds);
    const remainingSeconds = Math.max(0, expectedSeconds - workedSeconds);

    const breakSeconds = toSeconds(breakTimeFormatted);
    const breakLimitSeconds = breakLimitMinutes * 60;
    const breakPct = breakLimitSeconds > 0 ? (breakSeconds / breakLimitSeconds) * 100 : 0;
    const isBreakOverLimit = breakSeconds > breakLimitSeconds;

    const expectedWorkSeconds = expectedWorkHours * 3600;
    const halfDaySeconds = halfDayThresholdHours * 3600;

    const creditSeconds = Math.max(0, workedSeconds - expectedWorkSeconds);
    const creditHours = creditSeconds / 3600;

    const isHalfDayEligible = workedSeconds >= halfDaySeconds;
    const halfDayProgress = Math.min(100, (workedSeconds / halfDaySeconds) * 100);

    const deficitSeconds = Math.max(0, expectedWorkSeconds - workedSeconds);

    const todayLabel = new Date().toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    const displayId = employeeId || (session as any)?.employee_id || "—";

    const timeParts = (sessionTimeFormatted || "00:00:00").split(":");
    const timeLabels = timeParts.length === 3 ? ["hrs", "min", "sec"] : timeParts.length === 2 ? ["min", "sec"] : [];

    React.useEffect(() => {
        let cancelled = false;
        const loadBreaks = async () => {
            try {
                const response = await workSessionAPI.getEmployeeBreakHistory(
                    employeeId ? Number(employeeId) : undefined,
                    breakFromDate || today,
                    breakToDate || breakFromDate || today,
                );
                if (!cancelled && response?.success && Array.isArray(response.breaks)) {
                    setRangeBreaks(response.breaks);
                }
            } catch (error) {
                console.error("Failed to fetch employee break history:", error);
                if (!cancelled) setRangeBreaks([]);
            }
        };

        loadBreaks();
        return () => { cancelled = true; };
    }, [employeeId, breakFromDate, breakToDate, today]);

    const displayedBreaks = rangeBreaks.map((breakItem, index) => {
        const actualSeconds = Number(breakItem.actual_duration || 0);
        const allocatedSeconds = Number(breakItem.allocated_duration || 0) * 60;

        const efficiency = allocatedSeconds > 0
            ? (actualSeconds <= allocatedSeconds
                ? 100
                : Math.max(0, Math.min(100, Math.round((allocatedSeconds / actualSeconds) * 100))))
            : Number.parseInt(String(breakItem.efficiency || "0"), 10) || 0;

        const efficiencyLabel = efficiency >= 90 ? "Stable" : efficiency >= 75 ? "Watch" : "Review";
        const startedAt = breakItem.started_at ? new Date(breakItem.started_at) : null;
        const endedAt = breakItem.ended_at ? new Date(breakItem.ended_at) : null;
        const validStart = startedAt && !Number.isNaN(startedAt.getTime());
        const validEnd = endedAt && !Number.isNaN(endedAt.getTime());

        return {
            ...breakItem,
            type: breakItem.break_type || "Break",
            startTime: validStart ? startedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
            endTime: validEnd ? endedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
            dateLabel: validStart ? startedAt.toLocaleDateString([], { day: "2-digit", month: "short" }) : "—",
            duration: `${Math.round(actualSeconds / 60)}m`,
            efficiency: `${efficiency}%`,
            efficiencyLabel,
            details: breakItem.details || "Standard break",
        };
    });

    const setBreakRange = (from: string, to: string) => {
        setBreakFromDate(from || to || today);
        setBreakToDate(to || from || today);
    };
    const isBreakToday = breakFromDate === today && breakToDate === today;

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-3"
            style={{ background: "rgba(4,24,38,0.70)", backdropFilter: "blur(6px)" }}
        >
            <style>{LIVE_CSS}</style>

            <div
                className="rounded-2xl w-full max-w-[900px] max-h-[94vh] flex flex-col overflow-hidden"
                style={{
                    border: `1px solid ${BEZEL_LINE}`,
                    background: BEZEL,
                    boxShadow: "0 30px 70px -20px rgba(4,24,38,0.65), 0 0 0 1px rgba(255,255,255,0.03)",
                }}
            >
                <div
                    className="h-[2px] w-full shrink-0"
                    style={{ background: `linear-gradient(90deg, transparent 0%, ${ACCENT} 35%, ${hexToRgba(ACCENT, 0.4)} 70%, transparent 100%)` }}
                />

                <div
                    className="px-4 py-2 flex items-center justify-between gap-3 shrink-0 flex-wrap"
                    style={{ background: `linear-gradient(135deg, ${BEZEL} 0%, ${BEZEL_SOFT} 100%)`, borderBottom: `1px solid ${BEZEL_LINE}` }}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                                background: hexToRgba(ACCENT, 0.18),
                                border: `1px solid ${hexToRgba(ACCENT, 0.42)}`,
                                boxShadow: `0 0 16px -4px ${hexToRgba(ACCENT, 0.55)}`,
                            }}
                        >
                            <Timer size={16} style={{ color: ACCENT }} />
                        </span>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-[14px] font-semibold text-white leading-none whitespace-nowrap">Smart Time Tracking</h2>
                                <span
                                    className="hidden sm:flex items-center gap-1.5 text-[9.5px] font-bold px-2 py-[3px] rounded-full"
                                    style={{ color: statusColor, background: hexToRgba(statusColor, 0.18), border: `1px solid ${hexToRgba(statusColor, 0.3)}` }}
                                >
                                    <LiveDot color={statusColor} live={isSessionActive} />
                                    {getStatusLabel().toUpperCase()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={employeeName}
                                        className="rounded-full object-cover shrink-0"
                                        style={{ width: 18, height: 18, border: `1.5px solid ${hexToRgba(ACCENT, 0.5)}` }}
                                    />
                                ) : (
                                    <div
                                        className="rounded-full flex items-center justify-center shrink-0 text-[8px] font-bold"
                                        style={{ width: 18, height: 18, background: hexToRgba(ACCENT, 0.18), color: ACCENT, border: `1.5px solid ${hexToRgba(ACCENT, 0.5)}` }}
                                    >
                                        {getInitials(employeeName)}
                                    </div>
                                )}
                                <p className="text-[11.5px] font-semibold truncate leading-none text-white/95">{employeeName}</p>
                                <span className="text-white/25">&middot;</span>
                                <span className="flex items-center gap-1 text-[10.5px] text-white/60"><User size={10} /> <span style={{ fontFamily: MONO }}>{displayId}</span></span>
                                <span className="text-white/25">&middot;</span>
                                <span className="flex items-center gap-1 text-[10.5px] text-white/60"><Building2 size={10} /> {department}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${BEZEL_LINE}` }}>
                            <button
                                onClick={() => setActiveModalTab("tracker")}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
                                style={{ color: activeModalTab === "tracker" ? "#fff" : "rgba(255,255,255,0.65)", background: activeModalTab === "tracker" ? ACCENT : "transparent", boxShadow: activeModalTab === "tracker" ? `0 2px 8px -2px ${hexToRgba(ACCENT, 0.6)}` : "none" }}
                            >
                                <ActivityIcon size={12} />
                                Live Session
                            </button>
                            <button
                                onClick={() => setActiveModalTab("daily_updates")}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
                                style={{ color: activeModalTab === "daily_updates" ? "#fff" : "rgba(255,255,255,0.65)", background: activeModalTab === "daily_updates" ? ACCENT : "transparent", boxShadow: activeModalTab === "daily_updates" ? `0 2px 8px -2px ${hexToRgba(ACCENT, 0.6)}` : "none" }}
                            >
                                <CalendarDays size={12} />
                                Daily Updates
                            </button>
                        </div>
                        <span className="hidden md:flex items-center gap-1.5 text-[10.5px] font-medium px-2.5 py-1 rounded-lg text-white/70" style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${BEZEL_LINE}` }}>
                            <CalendarDays size={11} />
                            {todayLabel}
                            <span className="text-white/25">|</span>
                            <Clock size={11} />
                            <span style={{ fontFamily: MONO }}>{liveClock}</span>
                        </span>

                        {/* 🔊 Mute toggle */}
                        <button
                            onClick={() => setIsMuted((m) => !m)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                            title={isMuted ? "Unmute tracking sound" : "Mute tracking sound"}
                            aria-label={isMuted ? "Unmute tracking sound" : "Mute tracking sound"}
                        >
                            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {activeModalTab === "daily_updates" ? (
                    <div className="p-3 overflow-y-auto flex-1 min-h-0" style={{ background: SCREEN }}>
                        <EmployeeDailyUpdateView employeeId={employeeId ? Number(employeeId) : undefined} />
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 min-h-0 p-2.5 space-y-2.5" style={{ background: SCREEN, scrollbarWidth: "thin" }}>
                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-2.5 items-stretch">
                            <div
                                className="rounded-xl px-4 py-3 flex flex-col justify-between gap-3 relative overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${BEZEL} 0%, ${BEZEL_SOFT} 100%)`, boxShadow: CARD_SHADOW }}
                            >
                                <div
                                    className="pointer-events-none absolute inset-0"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                                        backgroundSize: "24px 24px",
                                        maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), transparent 90%)",
                                        WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), transparent 90%)",
                                    }}
                                />
                                <div
                                    className="pointer-events-none absolute inset-0"
                                    style={{ background: `radial-gradient(80% 130% at 100% 0%, ${hexToRgba(ACCENT, 0.24)} 0%, transparent 55%)` }}
                                />

                                <div className="relative flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 text-[11px] font-medium text-white/70">
                                        <LiveDot color={statusColor} live={isSessionActive} />
                                        Session elapsed
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={startSession}
                                            disabled={isSessionActive}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:cursor-default"
                                            style={{ background: isSessionActive ? hexToRgba(ACTIVE, 0.22) : ACCENT, color: isSessionActive ? "#4ade80" : "#fff", boxShadow: isSessionActive ? "none" : `0 4px 12px -4px ${hexToRgba(ACCENT, 0.7)}` }}
                                        >
                                            <Play size={11} fill={isSessionActive ? "#4ade80" : "#fff"} />
                                            {isSessionActive ? "Active" : "Start"}
                                        </button>
                                        <button
                                            onClick={() => (isOnBreak ? endBreak() : setIsBreakTypesOpen(true))}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:brightness-110"
                                            style={{ background: isOnBreak ? ACCENT : "rgba(255,255,255,0.10)", color: "#fff", border: `1px solid ${isOnBreak ? "transparent" : "rgba(255,255,255,0.16)"}` }}
                                        >
                                            <Pause size={11} />
                                            {isOnBreak ? "End Break" : "Break"}
                                        </button>
                                        <button
                                            onClick={() => { onClose(); triggerLogoutModal(); }}
                                            disabled={!isSessionActive}
                                            className="flex items-center justify-center w-7 h-7 rounded-lg transition-all disabled:opacity-30 disabled:cursor-default hover:brightness-110"
                                            style={{ background: "rgba(255,255,255,0.10)", color: "#fff", border: "1px solid rgba(255,255,255,0.16)" }}
                                            title="End session"
                                        >
                                            <Square size={10} />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative flex items-end justify-between gap-3 flex-wrap">
                                    <div className="flex items-start gap-1">
                                        {timeParts.map((part, i) => (
                                            <React.Fragment key={i}>
                                                {i > 0 && (
                                                    <span
                                                        className="att-colon text-[22px] font-bold leading-none mt-2 text-white/50"
                                                        style={{ fontFamily: MONO, animation: isWorking ? "att-blink 1s steps(1) infinite" : "none" }}
                                                    >
                                                        :
                                                    </span>
                                                )}
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className="rounded-lg px-2 py-1.5 min-w-[48px] text-center text-[26px] font-bold leading-none text-white"
                                                        style={{
                                                            fontFamily: MONO,
                                                            background: "rgba(255,255,255,0.08)",
                                                            border: `1px solid ${BEZEL_LINE}`,
                                                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                                                        }}
                                                    >
                                                        {part}
                                                    </div>
                                                    {timeLabels[i] && (
                                                        <span className="text-[9.5px] font-medium mt-1 text-white/45 leading-none">{timeLabels[i]}</span>
                                                    )}
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    <div className="flex flex-col items-end gap-1 pb-3">
                                        <LiveWave active={isWorking} />
                                        <span
                                            className="att-breathe text-[10px] font-semibold leading-none"
                                            style={{
                                                color: isWorking ? ACCENT : "rgba(255,255,255,0.45)",
                                                animation: isWorking ? "att-breathe 2s ease-in-out infinite" : "none",
                                            }}
                                        >
                                            {isWorking ? "Tracking activity" : getStatusLabel()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <StatTile
                                    icon={<Laptop size={12} style={{ color: ACCENT }} />}
                                    label="Active"
                                    value={workTimeFormatted}
                                    accent={ACCENT}
                                    pct={composition.activePct}
                                    pctLabel={`${composition.activePct}%`}
                                    live={isWorking}
                                />
                                <StatTile
                                    icon={<Coffee size={12} style={{ color: BREAKC }} />}
                                    label="Break"
                                    value={breakTimeFormatted}
                                    accent={BREAKC}
                                    pct={composition.breakPct}
                                    pctLabel={`${composition.breakPct}%`}
                                    live={isOnBreak}
                                />
                                <StatTile
                                    icon={<PauseCircle size={12} style={{ color: IDLE }} />}
                                    label="Idle"
                                    value={idleTimeFormatted}
                                    accent={IDLE}
                                    pct={composition.idlePct}
                                    pctLabel={`${composition.idlePct}%`}
                                    live={isSessionActive && currentState === "IDLE"}
                                />
                                <StatTile
                                    icon={<Target size={12} style={{ color: ACTIVE }} />}
                                    label="Score"
                                    value="100%"
                                    accent={ACTIVE}
                                    pct={100}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                            <div className="rounded-xl px-3.5 py-3 flex flex-col" style={CARD_STYLE}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: TEXT }}>
                                        <IconChip color={CREDIT}><TrendingUp size={11} style={{ color: CREDIT }} /></IconChip>
                                        Time Credit
                                    </h3>
                                    <span className="text-[10px] font-bold px-2 py-[2px] rounded-full" style={{
                                        color: creditSeconds > 0 ? CREDIT : MUTED,
                                        background: hexToRgba(creditSeconds > 0 ? CREDIT : MUTED, 0.12)
                                    }}>
                                        {creditSeconds > 0 ? `+${formatCredit(creditSeconds)}` : "No credit yet"}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Expected work</span>
                                        <span className="text-[11.5px] font-bold" style={{ fontFamily: MONO, color: TEXT }}>{expectedWorkHours}h 0m</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Actual worked</span>
                                        <span className="text-[11.5px] font-bold" style={{ fontFamily: MONO, color: TEXT }}>{formatCredit(workedSeconds)}</span>
                                    </div>
                                    <div className="h-[1px] w-full" style={{ background: MODULE_LINE }} />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Credit earned</span>
                                        <span className="text-[13px] font-bold" style={{ fontFamily: MONO, color: creditSeconds > 0 ? CREDIT : MUTED }}>
                                            {creditSeconds > 0 ? `+${formatCredit(creditSeconds)}` : "0h 0m"}
                                        </span>
                                    </div>
                                    {deficitSeconds > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Deficit</span>
                                            <span className="text-[11.5px] font-bold" style={{ fontFamily: MONO, color: DANGER }}>
                                                -{formatCredit(deficitSeconds)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-2.5 pt-2" style={{ borderTop: `1px solid ${MODULE_LINE}` }}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-medium" style={{ color: MUTED }}>Credit progress</span>
                                        <span className="text-[10px] font-bold" style={{ fontFamily: MONO, color: CREDIT }}>
                                            {creditHours.toFixed(1)}h
                                        </span>
                                    </div>
                                    <BudgetBar pct={Math.min(100, (creditSeconds / expectedWorkSeconds) * 100)} color={CREDIT} live={creditSeconds > 0} />
                                </div>
                            </div>

                            <div className="rounded-xl px-3.5 py-3 flex flex-col" style={CARD_STYLE}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: TEXT }}>
                                        <IconChip color={HALFDAY}><Award size={11} style={{ color: HALFDAY }} /></IconChip>
                                        Half-Day Advantage
                                    </h3>
                                    <span className="text-[10px] font-bold px-2 py-[2px] rounded-full" style={{
                                        color: isHalfDayEligible ? HALFDAY : MUTED,
                                        background: hexToRgba(isHalfDayEligible ? HALFDAY : MUTED, 0.12)
                                    }}>
                                        {isHalfDayEligible ? "Eligible" : "Not eligible"}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Threshold required</span>
                                        <span className="text-[11.5px] font-bold" style={{ fontFamily: MONO, color: TEXT }}>{halfDayThresholdHours}h 0m</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Current progress</span>
                                        <span className="text-[11.5px] font-bold" style={{ fontFamily: MONO, color: TEXT }}>{formatCredit(workedSeconds)}</span>
                                    </div>
                                    <div className="h-[1px] w-full" style={{ background: MODULE_LINE }} />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Status</span>
                                        <span className="text-[13px] font-bold" style={{ fontFamily: MONO, color: isHalfDayEligible ? HALFDAY : MUTED }}>
                                            {isHalfDayEligible ? "Half-day available" : "Keep working"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2.5 pt-2" style={{ borderTop: `1px solid ${MODULE_LINE}` }}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-medium" style={{ color: MUTED }}>Half-day progress</span>
                                        <span className="text-[10px] font-bold" style={{ fontFamily: MONO, color: HALFDAY }}>
                                            {Math.round(halfDayProgress)}%
                                        </span>
                                    </div>
                                    <BudgetBar pct={halfDayProgress} color={HALFDAY} live={isWorking} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-2.5 items-stretch">
                            <div className="rounded-xl px-3.5 py-3 flex flex-col" style={CARD_STYLE}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: TEXT }}>
                                        <IconChip color={ACCENT}><ListChecks size={11} style={{ color: ACCENT }} /></IconChip>
                                        Today&apos;s Activity
                                    </h3>
                                    <span className="text-[10.5px] font-medium" style={{ color: MUTED, fontFamily: MONO }}>
                                        {formatDuration(composition.total)} tracked
                                    </span>
                                </div>

                                <div className="h-2 w-full rounded-full overflow-hidden flex gap-[2px]" style={{ background: hexToRgba(BEZEL, 0.08) }}>
                                    {composition.activePct > 0 && (
                                        <div
                                            className={`relative overflow-hidden ${isWorking ? "att-shimmer" : ""}`}
                                            style={{ width: `${composition.activePct}%`, background: ACCENT, transition: "width 0.6s ease" }}
                                        />
                                    )}
                                    {composition.breakPct > 0 && <div style={{ width: `${composition.breakPct}%`, background: BREAKC, transition: "width 0.6s ease" }} />}
                                    {composition.idlePct > 0 && <div style={{ width: `${composition.idlePct}%`, background: IDLE, transition: "width 0.6s ease" }} />}
                                </div>

                                {recentActivities.length > 0 && (
                                    <div className="relative mt-2.5 pt-2" style={{ borderTop: `1px solid ${MODULE_LINE}` }}>
                                        <div className="absolute left-[5px] top-[18px] bottom-[10px] w-px" style={{ background: MODULE_LINE }} />
                                        <div>
                                            {recentActivities.slice(0, 4).map((activity, index) => {
                                                const dotColor = activity.type.includes("start") || activity.type.includes("PASSED")
                                                    ? ACTIVE
                                                    : activity.type.includes("end") || activity.type.includes("TIMEOUT")
                                                        ? DANGER
                                                        : activity.type.includes("BREAK")
                                                            ? ACCENT
                                                            : BREAKC;
                                                return (
                                                    <div key={index} className="relative flex items-center gap-2.5 py-1">
                                                        <span className="relative flex w-[11px] h-[11px] shrink-0">
                                                            {index === 0 && isSessionActive && (
                                                                <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-60" style={{ background: dotColor }} />
                                                            )}
                                                            <span className="relative inline-flex w-[11px] h-[11px] rounded-full" style={{ background: dotColor, border: `2px solid ${MODULE}`, boxShadow: `0 0 0 1px ${hexToRgba(dotColor, 0.35)}` }} />
                                                        </span>
                                                        <p className="text-[11.5px] font-medium truncate flex-1" style={{ color: TEXT }}>{activity.label}</p>
                                                        <p className="text-[10px] font-medium shrink-0 px-1.5 py-[1px] rounded-md" style={{ color: MUTED, fontFamily: MONO, background: hexToRgba(BEZEL, 0.05) }}>{activity.time}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl px-3.5 py-3 flex flex-col justify-center gap-2.5" style={CARD_STYLE}>
                                <div className="flex items-center gap-3.5">
                                    <div className="relative shrink-0" style={{ width: 84, height: 84 }}>
                                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                            <circle cx="50" cy="50" r={R} fill="none" stroke={hexToRgba(BEZEL, 0.08)} strokeWidth="8" />
                                            {ring.map((seg, i) => (
                                                <circle
                                                    key={i}
                                                    cx="50" cy="50" r={R}
                                                    fill="none"
                                                    stroke={seg.color}
                                                    strokeWidth="8"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${seg.len} ${CIRC - seg.len}`}
                                                    strokeDashoffset={seg.offset}
                                                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                                                />
                                            ))}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-[15px] font-bold leading-none" style={{ fontFamily: MONO, color: TEXT }}>100%</span>
                                            <span className="text-[9px] font-medium mt-0.5" style={{ color: MUTED }}>score</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Efficiency</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: ACTIVE, background: hexToRgba(ACTIVE, 0.12) }}>Stable</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Avg break</span>
                                            <span className="text-[11.5px] font-bold" style={{ fontFamily: MONO, color: TEXT }}>
                                                {breakHistory.length > 0 ? breakHistory[0].duration : "—"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Session</span>
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: statusColor, background: hexToRgba(statusColor, 0.12) }}>
                                                <LiveDot color={statusColor} live={isSessionActive} />
                                                {getStatusLabel()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5">
                                    <MiniStat label={`Focused ${composition.activePct}%`} value={formatDuration(composition.active)} color={ACCENT} />
                                    <MiniStat label={`Break ${composition.breakPct}%`} value={formatDuration(composition.brk)} color={BREAKC} />
                                    <MiniStat label={`Idle ${composition.idlePct}%`} value={formatDuration(composition.idle)} color={IDLE} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-2.5 items-stretch">
                            <div className="rounded-xl px-3.5 py-3 flex flex-col" style={CARD_STYLE}>
                                <div className="flex items-center justify-between mb-2.5">
                                    <h3 className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: TEXT }}>
                                        <IconChip color={ACCENT}><ShieldCheck size={11} style={{ color: ACCENT }} /></IconChip>
                                        Shift Compliance
                                    </h3>
                                    <span className="text-[9px] font-bold px-2 py-[3px] rounded-full" style={{ color: isBreakOverLimit ? DANGER : ACTIVE, background: hexToRgba(isBreakOverLimit ? DANGER : ACTIVE, 0.12) }}>
                                        {isBreakOverLimit ? "OVER BUDGET" : "ON SCHEDULE"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-3 flex-1 justify-center">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Worked vs. expected ({expectedHours}h shift)</span>
                                            <span className="text-[12px] font-bold" style={{ fontFamily: MONO, color: TEXT }}>{Math.min(100, Math.round(workPct))}%</span>
                                        </div>
                                        <BudgetBar pct={workPct} color={ACTIVE} live={isWorking} />
                                        <p className="text-[10.5px] mt-1 font-medium" style={{ color: MUTED }}>
                                            {overtimeSeconds > 0 ? (
                                                <span style={{ color: WARN, fontWeight: 600 }}>+{formatDuration(overtimeSeconds)} overtime</span>
                                            ) : (
                                                <>{formatDuration(remainingSeconds)} remaining</>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10.5px] font-medium" style={{ color: MUTED }}>Break usage (limit {breakLimitMinutes}m)</span>
                                            <span className="text-[12px] font-bold" style={{ fontFamily: MONO, color: isBreakOverLimit ? DANGER : TEXT }}>{Math.round(breakPct)}%</span>
                                        </div>
                                        <BudgetBar pct={breakPct} color={ACCENT} over={isBreakOverLimit} live={isOnBreak} />
                                        <p className="text-[10.5px] mt-1 font-medium flex items-center gap-1" style={{ color: isBreakOverLimit ? DANGER : MUTED }}>
                                            {isBreakOverLimit ? (
                                                <><AlertTriangle size={10} /> Exceeded by {formatDuration(breakSeconds - breakLimitSeconds)}</>
                                            ) : (
                                                <>{formatDuration(Math.max(0, breakLimitSeconds - breakSeconds))} remaining</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl overflow-hidden flex flex-col" style={CARD_STYLE}>
                                <div className="px-3.5 py-2.5" style={{ background: `linear-gradient(135deg, ${BEZEL} 0%, ${BEZEL_SOFT} 100%)` }}>
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: hexToRgba(ACCENT, 0.18) }}>
                                            <Coffee size={11} style={{ color: ACCENT }} />
                                        </span>
                                        <h3 className="text-[12px] font-semibold text-white whitespace-nowrap">Smart Breaks</h3>
                                        <span className="ml-auto text-[10px] font-medium text-white/70 px-2 py-[2px] rounded-full whitespace-nowrap" style={{ background: "rgba(255,255,255,0.09)" }}>
                                            {displayedBreaks.length} {isBreakToday ? "today" : "in range"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                        <input
                                            type="date"
                                            value={breakFromDate}
                                            onChange={(event) => setBreakRange(event.target.value, breakToDate)}
                                            className="flex-1 min-w-[110px] rounded-md border border-white/10 bg-white/10 px-1.5 py-[3px] text-[10.5px] text-white outline-none focus:border-white/30"
                                            style={{ colorScheme: "dark" }}
                                        />
                                        <span className="text-[10px] text-white/60">to</span>
                                        <input
                                            type="date"
                                            value={breakToDate}
                                            onChange={(event) => setBreakRange(breakFromDate, event.target.value)}
                                            className="flex-1 min-w-[110px] rounded-md border border-white/10 bg-white/10 px-1.5 py-[3px] text-[10.5px] text-white outline-none focus:border-white/30"
                                            style={{ colorScheme: "dark" }}
                                        />
                                        {!isBreakToday && (
                                            <button type="button" onClick={() => setBreakRange(today, today)} className="rounded-md border border-white/15 bg-white/10 hover:bg-white/20 transition-colors px-2 py-[3px] text-[10.5px] font-semibold text-white">
                                                Today
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", maxHeight: "190px" }}>
                                    {displayedBreaks.length > 0 ? (
                                        <table className="w-full text-left border-collapse">
                                            <thead className="sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-3.5 py-1.5 text-[9.5px] font-bold uppercase tracking-wide" style={{ color: MUTED, background: "#f6f9fc", borderBottom: `1px solid ${MODULE_LINE}` }}>Type & Details</th>
                                                    <th className="px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-wide" style={{ color: MUTED, background: "#f6f9fc", borderBottom: `1px solid ${MODULE_LINE}` }}>Time</th>
                                                    <th className="px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-wide text-right" style={{ color: MUTED, background: "#f6f9fc", borderBottom: `1px solid ${MODULE_LINE}` }}>Dur</th>
                                                    <th className="px-3.5 py-1.5 text-[9.5px] font-bold uppercase tracking-wide text-right" style={{ color: MUTED, background: "#f6f9fc", borderBottom: `1px solid ${MODULE_LINE}` }}>Eff</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayedBreaks.map((b, i) => {
                                                    const effColor = b.efficiencyLabel === "Stable" ? ACTIVE : b.efficiencyLabel === "Watch" ? WARN : DANGER;
                                                    return (
                                                        <tr key={i} className="transition-colors hover:bg-[#f6f9fc]" style={{ borderBottom: i < displayedBreaks.length - 1 ? `1px solid ${MODULE_LINE}` : "none" }}>
                                                            <td className="px-3.5 py-2 align-top">
                                                                <div className="flex items-start gap-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-[5px]" style={{ background: effColor }} />
                                                                    <div className="min-w-0">
                                                                        <p className="text-[11.5px] font-semibold capitalize leading-tight" style={{ color: TEXT }}>{b.type}</p>
                                                                        {b.details && b.details !== "—" ? (
                                                                            formatBreakDetails(b.details)
                                                                        ) : (
                                                                            <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>No additional details</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-2.5 py-2 align-top">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-[10.5px] font-medium whitespace-nowrap" style={{ color: TEXT, fontFamily: MONO }}>
                                                                        {b.startTime}&ndash;{b.endTime}
                                                                    </span>
                                                                    <span className="text-[9.5px] font-medium leading-none" style={{ color: MUTED }}>
                                                                        {b.dateLabel}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-2.5 py-2 align-top text-right">
                                                                <span className="text-[11.5px] font-bold" style={{ color: TEXT, fontFamily: MONO }}>{b.duration}</span>
                                                            </td>
                                                            <td className="px-3.5 py-2 align-top text-right">
                                                                <span className="text-[9.5px] font-bold px-1.5 py-[2px] rounded-full whitespace-nowrap" style={{ color: effColor, background: hexToRgba(effColor, 0.12) }}>{b.efficiencyLabel} {b.efficiency}</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="px-4 py-5 text-center">
                                            <span className="mx-auto mb-1.5 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: hexToRgba(BREAKC, 0.12) }}>
                                                <Coffee size={14} style={{ color: BREAKC }} />
                                            </span>
                                            <p className="text-[11px] font-medium" style={{ color: MUTED }}>{isBreakToday ? "No breaks taken today" : "No breaks found in this range"}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="px-4 py-1.5 flex items-center justify-between gap-2 shrink-0" style={{ background: BEZEL_DEEP, borderTop: `1px solid ${BEZEL_LINE}` }}>
                    <div className="flex items-center gap-2">
                        <LiveDot color={isSessionActive ? ACTIVE : "rgba(255,255,255,0.3)"} live={isSessionActive} />
                        <span className="text-[10.5px] font-medium text-white/60">
                            {isSessionActive ? `Session active (${currentState})` : "Session not started"}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-3.5 py-1 text-[11px] font-semibold rounded-lg transition-all hover:bg-white/10 text-white"
                        style={{ border: `1px solid ${BEZEL_LINE}` }}
                    >
                        Close
                    </button>
                </div>
            </div>
            {isBreakTypesOpen && (
                <BreakTypesModal
                    isOpen={isBreakTypesOpen}
                    onClose={() => setIsBreakTypesOpen(false)}
                    onSelectBreak={handleSelectBreakFromModal}
                    employeeId={employeeId}
                />
            )}
        </div>
    );
};

export default ActivityTrackerModal;