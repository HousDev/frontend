import React, { useEffect, useRef, useState } from "react";
import { Phone, Mail, MapPin, Users, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";

/* ===================== Types ===================== */
export type FollowupForm = {
    followupType: string;
    leadStage: string;
    leadStatus: string;
    remark: string;
    customRemark: string;
    nextAction: string;
    scheduleDate: string; // yyyy-mm-dd
    scheduleTime: string; // HH:MM
    priority: string; // 👈 NEW
    
};

// Create/Edit payload coming back out of the modal.
// If `id` exists => edit mode, otherwise create.
export type FollowupFormWithLead = FollowupForm & { lead_id: string; id?: string };

type APIRemarkData = {
    id: string | number;
    type1Name: string;
    value1Id: string;
    value1Name: string;
    type2Name: string;
    value2Id: string;
    value2Name: string;
    label?: string;
    value?: string;
    remarks?: string[];
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FollowupFormWithLead) => void;
    tabId: string;
    leadId: string;

    /** Optional: pass this when editing an existing follow-up */
    initialForm?: Partial<FollowupFormWithLead>; // can include id
};

export const FOLLOWUP_TYPES = [
    { value: "Phone Call", Icon: Phone, color: "blue" },
    { value: "WhatsApp", Icon: FaWhatsapp, color: "green" },
    { value: "Email", Icon: Mail, color: "indigo" },
    { value: "Site Visit", Icon: MapPin, color: "orange" },
    { value: "Meeting", Icon: Users, color: "purple" },
    { value: "Other", Icon: MessageSquare, color: "gray" },
] as const;

type Row = APIRemarkData;

const uniq = (arr: string[]) =>
    Array.from(new Set(arr.map((s) => (s || "").trim()).filter(Boolean)));

const extractAllOfTypeFrom = (rows: Row[], typeName: string) => {
    const vals: string[] = [];
    rows.forEach((r) => {
        if (r.type1Name === typeName) vals.push(r.value1Name);
        if (r.type2Name === typeName) vals.push(r.value2Name);
    });
    return uniq(vals);
};

const statusesForStageFrom = (rows: Row[], stage: string) => {
    const out: string[] = [];
    rows.forEach((r) => {
        const left =
            r.type1Name === "Lead Stage" &&
            r.value1Name === stage &&
            r.type2Name === "Lead Status";
        const right =
            r.type2Name === "Lead Stage" &&
            r.value2Name === stage &&
            r.type1Name === "Lead Status";
        if (left) out.push(r.value2Name);
        if (right) out.push(r.value1Name);
    });
    return uniq(out);
};

const remarksForStatusFrom = (rows: Row[], status: string) => {
    const out: string[] = [];
    rows.forEach((r) => {
        const statusMatches =
            (r.type1Name === "Lead Status" && r.value1Name === status) ||
            (r.type2Name === "Lead Status" && r.value2Name === status);

        if (statusMatches && Array.isArray(r.remarks) && r.remarks.length) {
            out.push(...r.remarks.filter(Boolean));
        }
        if (r.type1Name === "Lead Status" && r.value1Name === status && r.type2Name === "Remarks") {
            out.push(r.value2Name);
        }
        if (r.type2Name === "Lead Status" && r.value2Name === status && r.type1Name === "Remarks") {
            out.push(r.value1Name);
        }
    });
    return uniq(out);
};

/* -------- colored custom dropdown for Followup Type -------- */
type TypeOption = { value: string; Icon: any; color: string };

const TYPE_COLOR_TEXT: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    indigo: "text-indigo-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    gray: "text-gray-600",
};

const ColoredFollowupTypeSelect: React.FC<{
    options: readonly TypeOption[];
    value: string;
    onChange: (next: string) => void;
    disabled?: boolean;
}> = ({ options, value, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const current = options.find((o) => o.value === value) ?? options[0];
    const CurrentIcon = current.Icon;
    const colorClass = TYPE_COLOR_TEXT[current.color] || "text-gray-600";

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-left flex items-center gap-2 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? "opacity-60" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <CurrentIcon size={18} className={colorClass} />
                <span className="flex-1">{current.value}</span>
                <svg viewBox="0 0 20 20" className="w-4 h-4">
                    <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
            </button>

            {open && !disabled && (
                <div
                    role="listbox"
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                    {options.map((opt) => {
                        const Ico = opt.Icon;
                        const optColor = TYPE_COLOR_TEXT[opt.color] || "text-gray-600";
                        const selected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 
                            ${selected ? "bg-indigo-50" : ""}`}
                            >
                                <Ico size={18} className={optColor} />
                                <span>{opt.value}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
ColoredFollowupTypeSelect.displayName = "ColoredFollowupTypeSelect";

/* ------------------------- Modal ------------------------- */
const FollowupModal: React.FC<Props> = ({ isOpen, onClose, onSave, tabId, leadId, initialForm }) => {
    if (!isOpen) return null;

    const isEdit = Boolean(initialForm?.id);
    const [priorityOptions, setPriorityOptions] = useState<{ value: string, label: string }[]>([]);

    const [apiData, setApiData] = useState<Row[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Options
    const [availableStages, setAvailableStages] = useState<string[]>([]);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
    const [availableRemarks, setAvailableRemarks] = useState<string[]>([]);

    // Form state (seed with initialForm if present)
    const [form, setForm] = useState<FollowupForm>(() => ({
        followupType: initialForm?.followupType || FOLLOWUP_TYPES[0].value,
        leadStage: initialForm?.leadStage || "",
        leadStatus: initialForm?.leadStatus || "",
        remark: initialForm?.remark || "",
        customRemark: initialForm?.customRemark || "",
        nextAction: initialForm?.nextAction || "",
        scheduleDate: initialForm?.scheduleDate || "",
        scheduleTime: initialForm?.scheduleTime || "",
        priority: initialForm?.priority || " - ", // 👈 Default Priority
    }));
    useEffect(() => {
        const fetchPriorities = async () => {
            try {
                const data = await getMasterDropdownOptions(["lead"]);
                // 👆 "lead" masterType ke andar priorities hongi
                if (data["lead priority"]) {
                    setPriorityOptions(data["lead priority"]);
                }
            } catch (err) {
                console.error("❌ Error fetching lead priority:", err);
            }
        };

        if (isOpen) fetchPriorities();
    }, [isOpen]);
    /* Load mapping on open; if editing, pre-select dependent dropdowns */
    useEffect(() => {
        const load = async () => {
            if (!isOpen) return;
            setLoading(true);
            setError(null);
            try {
                const data = (await connectedRemarkAPI.getRemarksByTabId(tabId)) as Row[];
                const safe = Array.isArray(data) ? data : [];
                setApiData(safe);

                const stages = extractAllOfTypeFrom(safe, "Lead Stage");
                setAvailableStages(stages);

                // For edit: hydrate statuses/remarks chains
                if (initialForm?.leadStage) {
                    const sts = statusesForStageFrom(safe, initialForm.leadStage);
                    setAvailableStatuses(sts);
                    if (initialForm.leadStatus) {
                        const rems = remarksForStatusFrom(safe, initialForm.leadStatus);
                        setAvailableRemarks(rems);
                    } else {
                        setAvailableRemarks([]);
                    }
                } else {
                    setAvailableStatuses([]);
                    setAvailableRemarks([]);
                }
            } catch (e) {
                console.error("Failed to load follow-up options:", e);
                setError("Failed to load follow-up options.");
                setApiData([]);
                setAvailableStages([]);
                setAvailableStatuses([]);
                setAvailableRemarks([]);
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, tabId]);

    const handleChange =
        (key: keyof FollowupForm) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
                setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stage = e.target.value;
        const nextStatuses = stage ? statusesForStageFrom(apiData, stage) : [];
        setAvailableStatuses(nextStatuses);

        setAvailableRemarks([]);
        setForm((f) => ({
            ...f,
            leadStage: stage,
            leadStatus: "",
            remark: "",
            customRemark: "",
        }));
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const status = e.target.value;
        const nextRemarks = status ? remarksForStatusFrom(apiData, status) : [];
        setAvailableRemarks(nextRemarks);

        setForm((f) => ({
            ...f,
            leadStatus: status,
            remark: "",
            customRemark: "",
        }));
    };

    const handleRemarkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const remark = e.target.value;
        setForm((f) => ({
            ...f,
            remark,
            customRemark: remark ? `${remark} – ` : "",
        }));
    };

    // ⬇️ replace your handleSubmit with this guarded version
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // tiny validation – tweak as your rules require
        if (!form.leadStage) {
            alert("Please select a Lead Stage.");
            return;
        }
        if (!form.leadStatus) {
            alert("Please select a Lead Status.");
            return;
        }

        const payload: FollowupFormWithLead = {
            ...form,
            lead_id: leadId,
            ...(initialForm?.id ? { id: initialForm.id } : {}),
        };
        onSave(payload); // parent (page) converts date+time to ISO and calls create/update
    };



    // ⬇️ add this effect inside FollowupModal (under your other useEffects)
    useEffect(() => {
        if (!isOpen) return;
        setForm({
            followupType: initialForm?.followupType || FOLLOWUP_TYPES[0].value,
            leadStage: initialForm?.leadStage || "",
            leadStatus: initialForm?.leadStatus || "",
            remark: initialForm?.remark || "",
            customRemark: initialForm?.customRemark || "",
            nextAction: initialForm?.nextAction || "",
            scheduleDate: initialForm?.scheduleDate || "",
            scheduleTime: initialForm?.scheduleTime || "",
            priority: initialForm?.priority || "Medium", // 👈 here also
        });

        // also (re)hydrate dependent dropdowns when editing
        if (apiData.length && initialForm?.leadStage) {
            const sts = statusesForStageFrom(apiData, initialForm.leadStage);
            setAvailableStatuses(sts);
            const rems = initialForm.leadStatus ? remarksForStatusFrom(apiData, initialForm.leadStatus) : [];
            setAvailableRemarks(rems);
        } else {
            setAvailableStatuses([]);
            setAvailableRemarks([]);
        }
    }, [isOpen, initialForm, apiData]);


    const selectedType =
        FOLLOWUP_TYPES.find((t) => t.value === form.followupType) || FOLLOWUP_TYPES[0];
    const ringColor =
        selectedType.color === "blue"
            ? "focus:ring-blue-500"
            : selectedType.color === "green"
                ? "focus:ring-green-500"
                : selectedType.color === "indigo"
                    ? "focus:ring-indigo-500"
                    : selectedType.color === "orange"
                        ? "focus:ring-orange-500"
                        : selectedType.color === "purple"
                            ? "focus:ring-purple-500"
                            : "focus:ring-gray-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-5 m-4 max-h-[90vh] overflow-y-auto border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text">
                        {isEdit ? "Edit Follow-up" : "Add New Follow-up"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Followup Type</label>
                            <ColoredFollowupTypeSelect
                                options={FOLLOWUP_TYPES}
                                value={form.followupType}
                                onChange={(v) => setForm((f) => ({ ...f, followupType: v }))}
                                disabled={loading}
                            />
                        </div>
                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lead Priority</label>
                            <select
                                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={form.priority}
                                onChange={handleChange("priority")}
                            >
                                <option value="">Select Priority</option>
                                {priorityOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lead Stage</label>
                            <select
                                className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${ringColor}`}
                                value={form.leadStage}
                                onChange={handleStageChange}
                                disabled={loading || availableStages.length === 0}
                            >
                                <option value="">Select stage…</option>
                                {availableStages.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lead Status</label>
                            <select
                                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={form.leadStatus}
                                onChange={handleStatusChange}
                                disabled={loading || !form.leadStage || availableStatuses.length === 0}
                            >
                                <option value="">{form.leadStage ? "Select status…" : "Select stage first"}</option>
                                {availableStatuses.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Remarks</label>
                            <select
                                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={form.remark}
                                onChange={handleRemarkChange}
                                disabled={loading || !form.leadStatus || availableRemarks.length === 0}
                            >
                                <option value="">{form.leadStatus ? "Select remark…" : "Select status first"}</option>
                                {availableRemarks.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Custom Remark */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Custom Remark</label>
                        <textarea
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Select a remark above or type your own details…"
                            value={form.customRemark}
                            onChange={handleChange("customRemark")}
                        />
                    </div>

                    {/* Next Action */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Next Action</label>
                        <input
                            type="text"
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Enter next action..."
                            value={form.nextAction}
                            onChange={handleChange("nextAction")}
                        />
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Schedule Date</label>

                            {(() => {
                                // Calculate tomorrow's date
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const minDate = tomorrow.toISOString().split("T")[0];

                                return (
                                    <input
                                        type="date"
                                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        value={form.scheduleDate}
                                        onChange={handleChange("scheduleDate")}
                                        min={minDate}   // 👈 Sirf kal se future dates allowed
                                    />
                                );
                            })()}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
                            <input
                                type="time"
                                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                value={form.scheduleTime}
                                onChange={handleChange("scheduleTime")}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 transition-colors"
                            disabled={loading}
                        >
                            {isEdit ? "Update Follow-up" : "Save Follow-up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FollowupModal;
