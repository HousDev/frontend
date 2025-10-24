import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { getMasterDropdownOptions, type MasterOption } from "@/lib/useMasterData";
import { toast } from "react-toastify";
import valuationAPI from "@/lib/valuationAPI";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */
interface Props {
    open: boolean;
    onClose: () => void;
    onListProperty: () => void;
}
type Step = 1 | 2;
type Masters = Record<string, MasterOption[]>;

type EstimateResult = {
    low: number;
    high: number;
    ppsf: number;
    confidence: "Low" | "Medium" | "High";
    comps: Array<{ society: string; distance_km: number; month: string; price: number }>;
};

type FormState = {
    fullName: string;
    phone: string;
    email: string;
    type: string;
    unitType: string;
    society: string;
    location: string;
    carpet: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
const formatINR = (n?: number) =>
    typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "-";

const requiredFilled = (f: FormState) =>
    !!f.fullName &&
    !!f.phone &&
    !!f.email &&
    !!f.type &&
    !!f.unitType &&
    !!f.society &&
    !!f.location &&
    !!f.carpet;

const emailValid = (s: string) => /^\S+@\S+\.\S+$/.test(s);
const phoneDigits = (s: string) => s.replace(/[^\d]/g, "");

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
const ValuationModal: React.FC<Props> = ({ open, onClose, onListProperty }) => {
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [masterLoading, setMasterLoading] = useState(true);
    const [masters, setMasters] = useState<Masters>({});

    const [form, setForm] = useState<FormState>({
        fullName: "",
        phone: "",
        email: "",
        type: "",
        unitType: "",
        society: "",
        location: "",
        carpet: "",
    });

    const [result, setResult] = useState<EstimateResult | null>(null);

    // reset on open
    useEffect(() => {
        if (!open) return;
        setStep(1);
        setResult(null);
    }, [open]);

    // flatten master helper
    const flattenMasters = (data: any): Masters => {
        const flat: Masters = {};
        const walk = (obj: any) => {
            if (!obj || typeof obj !== "object") return;
            Object.entries(obj).forEach(([k, v]) => {
                if (Array.isArray(v)) flat[String(k).toLowerCase()] = v as MasterOption[];
                else if (v && typeof v === "object") walk(v);
            });
        };
        walk(data);
        return flat;
    };

    // fetch masters
    useEffect(() => {
        if (!open) return;
        const fetchMasters = async () => {
            try {
                setMasterLoading(true);
                const raw = await getMasterDropdownOptions(["common", "property"]);
                const flat = flattenMasters(raw);
                const needed: Masters = {
                    "property type": flat["property type"] || [],
                    "unit type": flat["unit type"] || [],
                };
                setMasters(needed);
            } catch {
                toast.error("Failed to load options");
            } finally {
                setMasterLoading(false);
            }
        };
        fetchMasters();
    }, [open]);

    // filter unitType by property type (simple contains rule)
    const unitTypeOptions = useMemo(() => {
        const all = masters["unit type"] || [];
        if (!form.type) return all;
        const filtered = all.filter((u) =>
            u.label.toLowerCase().includes(form.type.toLowerCase())
        );
        return filtered.length ? filtered : all;
    }, [masters, form.type]);

    // go straight to estimate (2-step flow)
    const handleContinue = () => {
        if (!requiredFilled(form)) return toast.info("Please fill all required fields.");
        if (!emailValid(form.email)) return toast.info("Please enter a valid email address.");
        const p = phoneDigits(form.phone);
        if (p.length < 10) return toast.info("Please enter a valid 10-digit phone number.");
        handleEstimate();
    };

    const handleEstimate = async () => {
        setLoading(true);
        try {
            const payload = {
                locality: form.location,
                propertyType: form.type,
                unitType: form.unitType,
                carpet_sqft: form.carpet ? Number(form.carpet) : undefined,
                contact: {
                    name: form.fullName,
                    phone: phoneDigits(form.phone),
                    email: form.email,
                },
                society: form.society,
            };

            const res = await valuationAPI.estimate(payload as any);
            const data = (res as any).data ?? res;
            if (!data) throw new Error("Estimation failed");

            setResult(data as EstimateResult);
            setStep(2);
        } catch (e: any) {
            toast.error(e?.message || "Estimation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Free Instant Property Valuation"
            /* 👇 give the modal enough width for 3 columns on large screens */
            width="max-w-[95vw] md:max-w-3xl lg:max-w-5xl"
        >
            <div className="text-gray-800 max-w-5xl w-full">
                <p className="text-xs text-gray-500 -mt-2 mb-3">
                    AI-powered estimate in under 30 seconds
                </p>

                {/* Stepper */}
                <div className="px-1 pt-1 mb-3">
                    <div className="flex items-center justify-between text-sm">
                        {[
                            { n: 1 as Step, label: "Property Details" },
                            { n: 2 as Step, label: "Estimate" },
                        ].map((s, idx) => {
                            const active = step === s.n;
                            const done = step > s.n;
                            return (
                                <div key={idx} className="flex-1 flex items-center">
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs mr-2 ${done
                                                ? "bg-green-600 text-white border-green-600"
                                                : active
                                                    ? "bg-[#E6761D] text-white border-[#E6761D]"
                                                    : "bg-white text-gray-600 border-gray-300"
                                            }`}
                                    >
                                        {s.n}
                                    </div>
                                    <span
                                        className={`${active ? "text-gray-900 font-medium" : "text-gray-500"
                                            } mr-2`}
                                    >
                                        {s.label}
                                    </span>
                                    {idx === 0 && <div className="flex-1 h-px bg-gray-200" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Body */}
                {step === 1 && (
                    <div className="space-y-4">
                        {/* 👇 1-col mobile, 2-col tablet, 3-col desktop */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                                <label className="text-sm text-gray-800">Full Name *</label>
                                <input
                                    className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
                                    placeholder="e.g. Kamlesh Shah"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-800">Phone *</label>
                                <input
                                    className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
                                    inputMode="numeric"
                                    placeholder="e.g. 98XXXXXXXX"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: phoneDigits(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-800">Email *</label>
                                <input
                                    className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
                                    type="email"
                                    placeholder="e.g. you@domain.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-800">Property Type *</label>
                                <select
                                    className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value, unitType: "" })}
                                >
                                    <option value="">Select</option>
                                    {(masters["property type"] || []).map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-800">Unit Type *</label>
                                <select
                                    className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
                                    value={form.unitType}
                                    onChange={(e) => setForm({ ...form, unitType: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    {unitTypeOptions.map((u) => (
                                        <option key={u.value} value={u.value}>
                                            {u.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-800">Society *</label>
                                <input
                                    className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
                                    placeholder="e.g. Kumar Primavera"
                                    value={form.society}
                                    onChange={(e) => setForm({ ...form, society: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-800">Location *</label>
                                <input
                                    className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
                                    placeholder="e.g. Viman Nagar, Pune"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-800">Carpet Area (sqft) *</label>
                                <input
                                    className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
                                    inputMode="numeric"
                                    placeholder="e.g. 925"
                                    value={form.carpet}
                                    onChange={(e) =>
                                        setForm({ ...form, carpet: e.target.value.replace(/[^\d.]/g, "") })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && result && (
                    <div className="space-y-5 text-gray-800">
                        <div className="bg-gray-50 border rounded-xl p-4">
                            <div className="text-sm text-gray-600">Estimated Price Range</div>
                            <div className="text-xl font-bold text-gray-800 mt-1">
                                {formatINR(result.low)} – {formatINR(result.high)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Confidence: {result.confidence}</div>
                            <div className="text-xs text-gray-600">Avg PPSF: {formatINR(result.ppsf)}</div>
                        </div>
                    </div>
                )}

                {step === 2 && !result && loading && (
                    <div className="flex items-center justify-center py-12 text-gray-600">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Estimating…
                    </div>
                )}

                {/* Footer Actions */}
                <div className="mt-6 border-t pt-3">
                    {step === 1 && (
                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-2 rounded-lg border text-gray-800" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-[#E6761D] text-white"
                                onClick={handleContinue}
                                disabled={masterLoading || loading}
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-wrap justify-end gap-2">
                            <button className="border rounded-lg px-4 py-2 text-gray-800" onClick={onListProperty}>
                                List My Property
                            </button>
                            <button
                                className="bg-[#E6761D] text-white rounded-lg px-4 py-2"
                                onClick={() => toast.info("Generating detailed PDF report…")}
                            >
                                Download Report (PDF)
                            </button>
                            <button
                                className="border rounded-lg px-4 py-2 text-gray-800"
                                onClick={() => toast.success("Our executive will contact you.")}
                            >
                                Schedule Visit
                            </button>
                            <button className="border rounded-lg px-4 py-2 text-gray-800" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ValuationModal;
