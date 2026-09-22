import React, { useState, useEffect, useCallback, ReactNode, ChangeEvent } from "react";
import { useActivityTracker } from "../context/ActivityTrackerContext";
import { workSessionAPI } from "@/lib/api";
import {
    Coffee,
    Utensils,
    Users,
    MapPinned,
    Building,
    FileText,
    User,
    TrendingUp,
    Play,
    X,
    ChevronRight,
    Clock,
    Calendar,
    Tag,
    Star,
    RefreshCw,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Info,
} from "lucide-react";

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

// Icon resolver helper for dynamic master data
const getBreakIcon = (iconName?: string) => {
    switch ((iconName || "").toLowerCase()) {
        case "coffee":
        case "tea":
            return Coffee;
        case "utensils":
        case "lunch":
        case "food":
            return Utensils;
        case "user":
        case "personal":
            return User;
        case "filetext":
        case "file":
        case "documentation":
            return FileText;
        case "trendingup":
        case "trending":
        case "market_research":
            return TrendingUp;
        case "users":
        case "meeting":
            return Users;
        case "mappinned":
        case "location":
        case "site_visit":
            return MapPinned;
        case "building":
        case "property_visit":
            return Building;
        default:
            return Coffee;
    }
};

// Section heading component matching ActivityTrackerModal style
const SectionHeading = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1.5" style={{ color: N }}>
        <Icon size={12} style={{ color: O }} />
        {title}
    </h3>
);

// Compact stat card for break type selection
const BreakTypeCard = ({
    icon: Icon,
    label,
    duration,
    productivity,
    dailyLimit,
    usedToday,
    remainingToday,
    isSelected,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    duration: number;
    productivity: number;
    dailyLimit?: number;
    usedToday?: number;
    remainingToday?: number | null;
    isSelected: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-2 rounded-lg border transition-all text-left relative overflow-hidden ${
            isSelected
                ? "border-orange-400 bg-orange-50 shadow-xs"
                : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
    >
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
                <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: isSelected ? `${O}20` : "#f1f5f9" }}
                >
                    <Icon size={13} style={{ color: isSelected ? O : MU }} />
                </div>
                <div className="min-w-0">
                    <span className="text-[11px] font-bold truncate block" style={{ color: N }}>
                        {label}
                    </span>
                    {dailyLimit !== undefined && dailyLimit > 0 && (
                        <span className="text-[8.5px] font-semibold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                            {usedToday || 0}/{dailyLimit} used ({remainingToday ?? (dailyLimit - (usedToday || 0))} left)
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-0.5">
                    <Clock size={8} style={{ color: MU }} />
                    <span className="text-[9px] font-semibold" style={{ color: MU }}>{duration}m</span>
                </div>
                {productivity > 0 && (
                    <div className="flex items-center gap-0.5">
                        <Star size={8} style={{ color: "#22c55e" }} />
                        <span className="text-[9px] font-bold text-green-600">+{Math.round(productivity * 100)}%</span>
                    </div>
                )}
                <ChevronRight size={12} style={{ color: isSelected ? O : MU }} />
            </div>
        </div>
    </button>
);

// Compact input field
const CompactInputField = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    required,
}: {
    label: string;
    type?: string;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
}) => (
    <div>
        <label className="block text-[9px] font-medium mb-1" style={{ color: MU }}>
            {label} {required && <span style={{ color: O }}>*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            style={{ borderColor: BD, background: BG }}
        />
    </div>
);

// Compact select field
const CompactSelectField = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    required,
}: {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
    placeholder?: string;
    required?: boolean;
}) => (
    <div>
        <label className="block text-[9px] font-medium mb-1" style={{ color: MU }}>
            {label} {required && <span style={{ color: O }}>*</span>}
        </label>
        <select
            value={value}
            onChange={onChange}
            className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            style={{ borderColor: BD, background: BG }}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    </div>
);

// Compact textarea
const CompactTextarea = ({
    label,
    value,
    onChange,
    placeholder,
    rows = 2,
}: {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
}) => (
    <div>
        <label className="block text-[9px] font-medium mb-1" style={{ color: MU }}>{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full border rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none font-medium"
            style={{ borderColor: BD, background: BG }}
        />
    </div>
);

/* ------------------ Modal Wrapper ------------------ */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
            style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                style={{ border: `1px solid ${BD}` }}
            >
                {children}
            </div>
        </div>
    );
};

/* ------------------ Dynamic Break Type Interface ------------------ */
export interface DynamicBreakType {
    id: number | string;
    break_key: string;
    label: string;
    name?: string;
    icon?: string;
    duration: number;
    productivity: number;
    daily_limit: number;
    used_today: number;
    remaining_today: number | null;
    is_limit_reached: boolean;
    requires_client?: boolean;
    requires_location?: boolean;
    requires_notes?: boolean;
    is_active?: boolean;
    display_order?: number;
}

export interface BreakCustomDetails {
    clientName: string;
    property: string;
    meetingNotes: string;
    customDuration: string;
    priority: string;
    meetingWith: string;
    meetingPurpose: string;
}

interface BreakTypesModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSelectBreak?: (breakType: string, details: BreakCustomDetails & { duration: string | number }) => void;
    employeeId?: number | string;
}

const BreakTypesModal: React.FC<BreakTypesModalProps> = ({
    isOpen = true,
    onClose = () => {},
    onSelectBreak = () => {},
    employeeId,
}) => {
    let breakHistoryList: any[] = [];
    try {
        const tracker = useActivityTracker();
        if (tracker && tracker.breakHistory) {
            breakHistoryList = tracker.breakHistory;
        }
    } catch {
        breakHistoryList = [];
    }

    const [breakTypes, setBreakTypes] = useState<DynamicBreakType[]>([]);
    const [loadingTypes, setLoadingTypes] = useState<boolean>(true);
    const [selectedBreakType, setSelectedBreakType] = useState<string>("");
    const [showExhausted, setShowExhausted] = useState<boolean>(false);
    const [breakCustomDetails, setBreakCustomDetails] = useState<BreakCustomDetails>({
        clientName: "",
        property: "",
        meetingNotes: "",
        customDuration: "",
        priority: "medium",
        meetingWith: "",
        meetingPurpose: "",
    });

    const clients = ["John Doe", "Jane Smith", "Michael Johnson", "Amit Patel", "Rahul Sharma"];
    const properties = ["Sunrise Apartments", "Green Villa", "Ocean View Flats", "Palm Grove 3BHK", "Skyline Tower"];

    // Fetch dynamic break types from Master Data / API
    const fetchBreakTypes = useCallback(async () => {
        setLoadingTypes(true);
        try {
            const empId = employeeId ? Number(employeeId) : undefined;
            const res = await workSessionAPI.getBreakTypes(empId);
            if (res?.success && Array.isArray(res.breakTypes)) {
                setBreakTypes(res.breakTypes);
            }
        } catch (err) {
            console.error("Failed to load master break types:", err);
        } finally {
            setLoadingTypes(false);
        }
    }, [employeeId]);

    useEffect(() => {
        if (isOpen) {
            fetchBreakTypes();
        }
    }, [isOpen, fetchBreakTypes]);

    const resetDetails = () =>
        setBreakCustomDetails({
            clientName: "",
            property: "",
            meetingNotes: "",
            customDuration: "",
            priority: "medium",
            meetingWith: "",
            meetingPurpose: "",
        });

    const handleBreakTypeSelect = (breakKey: string) => {
        setSelectedBreakType(breakKey);
        resetDetails();
    };

    const handleBreakStart = () => {
        if (!selectedBreakType) return;

        const category = breakTypes.find((cat) => (cat.break_key || cat.id) === selectedBreakType);
        const breakDetails = {
            ...breakCustomDetails,
            duration: breakCustomDetails.customDuration || category?.duration || 0,
        };

        onSelectBreak(selectedBreakType, breakDetails);
        resetDetails();
        setSelectedBreakType("");
        onClose();
    };

    // Filter available vs limit-reached breaks
    const availableBreakTypes = breakTypes.filter((b) => !b.is_limit_reached);
    const limitReachedBreakTypes = breakTypes.filter((b) => b.is_limit_reached);

    const getSelectedCategory = () =>
        breakTypes.find((cat) => (cat.break_key || cat.id) === selectedBreakType);

    const renderBreakDetails = () => {
        const category = getSelectedCategory();
        if (!category) return null;

        const needsClientInfo =
            category.requires_client ||
            ["site_visit", "property_visit", "documentation"].includes(category.break_key);
        const needsLocation =
            category.requires_location ||
            ["site_visit", "property_visit"].includes(category.break_key);
        const needsNotes =
            category.requires_notes ||
            ["personal", "documentation", "market_research"].includes(category.break_key);

        return (
            <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {needsClientInfo && (
                        <CompactSelectField
                            label="Client Name*"
                            value={breakCustomDetails.clientName}
                            onChange={(e) =>
                                setBreakCustomDetails((prev) => ({ ...prev, clientName: e.target.value }))
                            }
                            options={clients}
                            placeholder="Select client"
                            required
                        />
                    )}

                    {needsLocation && (
                        <CompactSelectField
                            label="Property*"
                            value={breakCustomDetails.property}
                            onChange={(e) =>
                                setBreakCustomDetails((prev) => ({ ...prev, property: e.target.value }))
                            }
                            options={properties}
                            placeholder="Select property"
                            required
                        />
                    )}

                    {category.break_key === "meeting" && (
                        <>
                            <CompactInputField
                                label="Meeting With*"
                                value={breakCustomDetails.meetingWith}
                                onChange={(e) =>
                                    setBreakCustomDetails((prev) => ({ ...prev, meetingWith: e.target.value }))
                                }
                                placeholder="e.g., Team Meeting, Client Discussion"
                                required
                            />
                            <CompactInputField
                                label="Meeting Purpose"
                                value={breakCustomDetails.meetingPurpose}
                                onChange={(e) =>
                                    setBreakCustomDetails((prev) => ({ ...prev, meetingPurpose: e.target.value }))
                                }
                                placeholder="e.g., Strategy Discussion, Deal Review"
                            />
                        </>
                    )}

                    <CompactInputField
                        label="Duration (minutes)"
                        type="number"
                        value={breakCustomDetails.customDuration}
                        onChange={(e) =>
                            setBreakCustomDetails((prev) => ({ ...prev, customDuration: e.target.value }))
                        }
                        placeholder={category.duration.toString()}
                    />

                    <CompactSelectField
                        label="Priority"
                        value={breakCustomDetails.priority}
                        onChange={(e) =>
                            setBreakCustomDetails((prev) => ({ ...prev, priority: e.target.value }))
                        }
                        options={["low", "medium", "high", "urgent"]}
                        placeholder="Select priority"
                    />
                </div>

                {needsNotes && (
                    <CompactTextarea
                        label="Notes (Optional)"
                        value={breakCustomDetails.meetingNotes}
                        onChange={(e) =>
                            setBreakCustomDetails((prev) => ({ ...prev, meetingNotes: e.target.value }))
                        }
                        placeholder="Add notes or details"
                        rows={3}
                    />
                )}
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* Header - Matching ActivityTrackerModal style */}
            <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between shrink-0" style={{ background: N }}>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
                        <Coffee size={14} style={{ color: O }} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Start Smart Break</h2>
                        <p className="text-[9px] text-white/60">Dynamic Master Break Types & Daily Limit Tracker</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchBreakTypes}
                        title="Refresh break options"
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                    >
                        <RefreshCw size={13} className={loadingTypes ? "animate-spin text-orange-400" : ""} />
                    </button>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
                {/* Break Type Selection - Loaded Dynamically from Master Data */}
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                    <div className="flex items-center justify-between mb-2">
                        <SectionHeading icon={Tag} title="Select Break Type" />
                        <span className="text-[9px] text-slate-400 font-medium">
                            {availableBreakTypes.length} Available
                            {limitReachedBreakTypes.length > 0 && ` • ${limitReachedBreakTypes.length} Limit Reached`}
                        </span>
                    </div>

                    {loadingTypes ? (
                        <div className="py-6 text-center text-slate-400 space-y-2">
                            <RefreshCw className="w-5 h-5 mx-auto animate-spin text-orange-500" />
                            <p className="text-[10px] font-semibold">Loading available break types...</p>
                        </div>
                    ) : availableBreakTypes.length === 0 ? (
                        <div className="py-6 px-4 text-center rounded-lg bg-amber-50/70 border border-amber-200 text-amber-800 space-y-1.5">
                            <AlertCircle className="w-6 h-6 mx-auto text-amber-600" />
                            <p className="text-xs font-bold">All Daily Break Limits Reached</p>
                            <p className="text-[10px] text-amber-700">
                                You have used the maximum allowed breaks for today according to master data settings.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {availableBreakTypes.map((category) => {
                                const IconComponent = getBreakIcon(category.icon || category.break_key);
                                const key = category.break_key || String(category.id);
                                return (
                                    <BreakTypeCard
                                        key={key}
                                        icon={IconComponent}
                                        label={category.label || category.name || key}
                                        duration={category.duration}
                                        productivity={category.productivity}
                                        dailyLimit={category.daily_limit}
                                        usedToday={category.used_today}
                                        remainingToday={category.remaining_today}
                                        isSelected={selectedBreakType === key}
                                        onClick={() => handleBreakTypeSelect(key)}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Limit reached hidden breaks toggle */}
                    {limitReachedBreakTypes.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setShowExhausted(!showExhausted)}
                                className="text-[9.5px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
                            >
                                <Info size={11} className="text-amber-500" />
                                {showExhausted ? "Hide" : "View"} {limitReachedBreakTypes.length} option{limitReachedBreakTypes.length > 1 ? "s" : ""} hidden due to daily limit
                            </button>

                            {showExhausted && (
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 opacity-60">
                                    {limitReachedBreakTypes.map((category) => {
                                        const IconComponent = getBreakIcon(category.icon || category.break_key);
                                        return (
                                            <div
                                                key={category.break_key || category.id}
                                                className="p-2 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-between text-left"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <IconComponent size={13} className="text-slate-400 shrink-0" />
                                                    <div className="min-w-0">
                                                        <span className="text-[10.5px] font-semibold text-slate-600 block line-through">
                                                            {category.label || category.name}
                                                        </span>
                                                        <span className="text-[8.5px] font-bold text-rose-700 bg-rose-100 px-1 py-0.2 rounded">
                                                            Limit reached ({category.used_today}/{category.daily_limit} used)
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400">Hidden</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Break Details - Only show when a break type is selected */}
                {selectedBreakType && (
                    <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                        <div className="flex items-center justify-between mb-2">
                            <SectionHeading icon={Calendar} title="Activity Details" />
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: O }} />
                                <span className="text-[8px] font-bold" style={{ color: MU }}>
                                    {getSelectedCategory()?.label || getSelectedCategory()?.name}
                                </span>
                            </div>
                        </div>
                        {renderBreakDetails()}
                    </div>
                )}

                {/* Quick Stats Preview when break type is selected */}
                {selectedBreakType && (
                    <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                        <SectionHeading icon={TrendingUp} title="Productivity Impact" />
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center justify-between p-1.5 rounded" style={{ background: `${O}10` }}>
                                <span className="text-[9px] font-semibold" style={{ color: MU }}>Est. Productivity</span>
                                <span className="text-[10px] font-bold" style={{ color: O }}>
                                    +{Math.round((getSelectedCategory()?.productivity || 0) * 100)}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-1.5 rounded" style={{ background: `${N}05` }}>
                                <span className="text-[9px] font-semibold" style={{ color: MU }}>Time Investment</span>
                                <span className="text-[10px] font-bold" style={{ color: N }}>
                                    {breakCustomDetails.customDuration || getSelectedCategory()?.duration} min
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Smart Break History Table */}
                <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BD}` }}>
                    <div className="px-3 py-2 flex items-center justify-between" style={{ background: N }}>
                        <h3 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <Coffee size={11} style={{ color: O }} />
                            Today&apos;s Break Log
                        </h3>
                        <span className="text-[9px] text-white/60">
                            {breakHistoryList.length} break{breakHistoryList.length !== 1 ? "s" : ""} recorded
                        </span>
                    </div>
                    <div className="overflow-x-auto max-h-40" style={{ scrollbarWidth: "thin" }}>
                        <table className="w-full">
                            <thead>
                                <tr style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
                                    {["#", "Type", "Start", "End", "Duration", "Details", "Efficiency"].map((h) => (
                                        <th key={h} className="px-3 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider" style={{ color: MU }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y" style={{ borderColor: BD }}>
                                {breakHistoryList.length > 0 ? (
                                    breakHistoryList.map((b, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-1.5 text-[10px] font-medium" style={{ color: N }}>{b.number || i + 1}</td>
                                            <td className="px-3 py-1.5 text-[10px] font-semibold" style={{ color: MU }}>{b.type}</td>
                                            <td className="px-3 py-1.5 text-[10px]" style={{ color: MU }}>{b.startTime}</td>
                                            <td className="px-3 py-1.5 text-[10px]" style={{ color: MU }}>{b.endTime}</td>
                                            <td className="px-3 py-1.5 text-[10px] font-medium" style={{ color: N }}>{b.duration}</td>
                                            <td className="px-3 py-1.5 text-[10px]" style={{ color: MU }}>{b.details}</td>
                                            <td className="px-3 py-1.5 text-[10px] font-bold text-green-600">{b.efficiency || "95%"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-6 text-center">
                                            <Coffee size={20} className="mx-auto mb-1 opacity-20" />
                                            <p className="text-[10px] font-medium" style={{ color: MU }}>No breaks taken today</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer - Matching ActivityTrackerModal style */}
            <div className="px-4 sm:px-5 py-2.5 border-t flex items-center justify-between gap-2 shrink-0" style={{ borderColor: BD, background: BG }}>
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedBreakType ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-[9px] font-medium" style={{ color: MU }}>
                        {selectedBreakType ? "Ready to start activity" : "Select an activity type to start"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 text-[10px] font-semibold rounded-lg transition-all hover:bg-slate-200/70"
                        style={{ border: `1px solid ${BD}`, color: N }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleBreakStart}
                        disabled={!selectedBreakType}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                            selectedBreakType
                                ? "text-white shadow-xs hover:opacity-90"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        style={selectedBreakType ? { background: O } : {}}
                    >
                        <Play size={10} />
                        Start Activity
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BreakTypesModal;