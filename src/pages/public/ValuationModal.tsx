// src/pages/ValuationModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { X, Loader2 } from "lucide-react";
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
type Step = 1 | 2 | 3;
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
    type: string;      // property type
    unitType: string;  // unit type from master
    society: string;
    location: string;
    carpet: string;    // string input, parsed to number on submit
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

    // ---- form ----
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

    // reset when opened/closed
    useEffect(() => {
        if (!open) return;
        setStep(1);
        setResult(null);
    }, [open]);

    // ------- flatten helper -------
    const flattenMasters = (data: any): Masters => {
        const flat: Masters = {};
        const walk = (obj: any) => {
            if (!obj || typeof obj !== "object") return;
            Object.entries(obj).forEach(([k, v]) => {
                if (Array.isArray(v)) {
                    flat[String(k).toLowerCase()] = v as MasterOption[];
                } else if (v && typeof v === "object") {
                    walk(v);
                }
            });
        };
        walk(data);
        return flat;
    };

    // ------- fetch only what we need -------
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
                    amenities: flat["amenities"] || [],
                };

                setMasters(needed);
            } catch (err) {
                console.error("Error fetching master options:", err);
                toast.error("Failed to load options");
            } finally {
                setMasterLoading(false);
            }
        };

        fetchMasters();
    }, [open]);

    // derive unitType options filtered by property type if your master encodes parent info
    const unitTypeOptions = useMemo(() => {
        const all = masters["unit type"] || [];
        if (!form.type) return all;
        const filtered = all.filter((u) =>
            u.label.toLowerCase().includes(form.type.toLowerCase())
        );
        return filtered.length ? filtered : all;
    }, [masters, form.type]);

    const goToStep2 = () => {
        if (!requiredFilled(form)) {
            toast.info("Please fill all required fields.");
            return;
        }
        if (!emailValid(form.email)) {
            toast.info("Please enter a valid email address.");
            return;
        }
        const p = phoneDigits(form.phone);
        if (p.length < 10) {
            toast.info("Please enter a valid 10-digit phone number.");
            return;
        }
        setStep(2);
    };

    const handleEstimate = async () => {
        setLoading(true);
        try {
            const payload = {
                // Your backend earlier expected city/locality; we pass location as locality for now.
                locality: form.location || undefined,
                propertyType: form.type || undefined,
                unitType: form.unitType || undefined,
                carpet_sqft: form.carpet ? Number(form.carpet) : undefined,
                // Optionally you could also pass contact + society (if backend accepts):
                contact: {
                    name: form.fullName,
                    phone: phoneDigits(form.phone),
                    email: form.email,
                },
                society: form.society || undefined,
            };

            const res = await valuationAPI.estimate(payload as any);

            if (!res || (typeof res === "object" && "success" in res && !res.success)) {
                const errMsg =
                    res && typeof res === "object" && "error" in res
                        ? (res as any).error
                        : "Could not estimate";
                throw new Error(errMsg);
            }

            const data = (res as any).data ?? res; // support both shapes
            setResult(data as EstimateResult);
            setStep(3);
        } catch (e: any) {
            toast.error(e?.message || "Estimation failed");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div>
                        <h3 className="text-lg font-semibold text-black">Free Instant Property Valuation</h3>
                        <p className="text-xs text-gray-500">AI-powered estimate in under 30 seconds</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
                        <X size={18} className="text-gray-600" />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-5 pt-4">
                    <div className="flex items-center justify-between text-sm">
                        {[
                            { n: 1, label: "Property Details" },
                            { n: 2, label: "Options" },
                            { n: 3, label: "Estimate" },
                        ].map((s) => {
                            const active = step === (s.n as Step);
                            const done = step > (s.n as Step);
                            return (
                                <div key={s.n} className="flex-1 flex items-center">
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
                                    <span className={`${active ? "text-gray-900 font-medium" : "text-gray-500"} mr-2`}>
                                        {s.label}
                                    </span>
                                    {s.n !== 3 && <div className="flex-1 h-px bg-gray-200" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Body */}
                <div className="p-5">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Full Name */}
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="w-full mt-1 border rounded-lg p-2 text-black"
                                        placeholder="e.g. Kamlesh Shah"
                                        value={form.fullName}
                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="w-full mt-1 border rounded-lg p-2 text-black"
                                        inputMode="numeric"
                                        placeholder="e.g. 98XXXXXXXX"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: phoneDigits(e.target.value) })}
                                        maxLength={15}
                                    />
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="w-full mt-1 border rounded-lg p-2 text-black"
                                        type="email"
                                        placeholder="e.g. you@company.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>

                                {/* Property Type */}
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Property Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full mt-1 border rounded-lg p-2 text-black focus:border-[#E6761D] focus:ring-0"
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value, unitType: "" })}
                                        disabled={masterLoading}
                                    >
                                        <option value="">{masterLoading ? "Loading..." : "Select"}</option>
                                        {(masters["property type"] || []).map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Unit Type */}
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Unit Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full mt-1 border rounded-lg p-2 text-black focus:border-[#E6761D] focus:ring-0"
                                        value={form.unitType}
                                        onChange={(e) => setForm({ ...form, unitType: e.target.value })}
                                        disabled={masterLoading}
                                    >
                                        <option value="">{masterLoading ? "Loading..." : "Select"}</option>
                                        {unitTypeOptions.map((u) => (
                                            <option key={u.value} value={u.value}>
                                                {u.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Society Name */}
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Society Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="w-full mt-1 border rounded-lg p-2 text-black"
                                        placeholder="e.g. Kumar Primavera"
                                        value={form.society}
                                        onChange={(e) => setForm({ ...form, society: e.target.value })}
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="w-full mt-1 border rounded-lg p-2 text-black"
                                        placeholder="e.g. Viman Nagar, Pune"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    />
                                </div>

                                {/* Carpet Area */}
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Carpet Area (sq ft) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="w-full mt-1 border rounded-lg p-2 text-black"
                                        inputMode="numeric"
                                        placeholder="e.g. 925"
                                        value={form.carpet}
                                        onChange={(e) =>
                                            setForm({ ...form, carpet: e.target.value.replace(/[^\d.]/g, "") })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button className="px-4 py-2 rounded-lg border text-black" onClick={onClose}>
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg bg-[#E6761D] text-white disabled:opacity-60 flex items-center gap-2"
                                    onClick={goToStep2}
                                    disabled={masterLoading}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {/* Amenities (optional) */}
                            {(masters["amenities"]?.length || 0) > 0 && (
                                <>
                                    <label className="text-sm text-gray-600">Amenities (optional)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(masters["amenities"] || []).slice(0, 16).map((a) => {
                                            const active = false; // no amenities stored in this trimmed form
                                            return (
                                                <button
                                                    key={a.value}
                                                    type="button"
                                                    className={`px-3 py-1 rounded-full text-sm border transition ${active
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                    disabled
                                                    title="Not required for this quick form"
                                                >
                                                    {a.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between">
                                <button
                                    className="px-4 py-2 rounded-lg border text-black hover:bg-gray-100"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>

                                <button
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg bg-[#E6761D] text-white flex items-center gap-2"
                                    onClick={handleEstimate}
                                >
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    {loading ? "Estimating..." : "Get Estimate"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && result && (
                        <div className="space-y-5">
                            <div className="bg-gray-50 border rounded-xl p-4">
                                <div className="text-sm text-gray-600">Estimated Price Range</div>
                                <div className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatINR(result.low)} – {formatINR(result.high)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Confidence: {result.confidence}</div>
                                <div className="text-xs text-gray-500">Avg PPSF: {formatINR(result.ppsf)}</div>
                            </div>

                            {!!result.comps?.length && (
                                <div>
                                    <div className="font-semibold mb-2">Nearby Comparables</div>
                                    <ul className="space-y-2 text-sm">
                                        {result.comps.map((c, i) => (
                                            <li key={i} className="flex justify-between border-b pb-2">
                                                <span>
                                                    {c.society} • {c.month}
                                                </span>
                                                <span>
                                                    {formatINR(c.price)} ({c.distance_km} km)
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button className="flex-1 border rounded-lg px-4 py-2" onClick={onListProperty}>
                                    List My Property
                                </button>
                                <button
                                    className="flex-1 bg-[#E6761D] text-white rounded-lg px-4 py-2"
                                    onClick={() => {
                                        toast.info("Generating detailed PDF report…");
                                        // hook your PDF flow here
                                    }}
                                >
                                    Download Detailed Report (PDF)
                                </button>
                                <button
                                    className="flex-1 border rounded-lg px-4 py-2"
                                    onClick={() => {
                                        toast.success("Our executive will contact you to schedule a visit.");
                                        // hook schedule visit/callback here
                                    }}
                                >
                                    Schedule Free Site Visit
                                </button>
                            </div>

                            <div className="flex justify-between">
                                <button className="px-4 py-2 rounded-lg border" onClick={() => setStep(2)}>
                                    Back
                                </button>
                                <button className="px-4 py-2 rounded-lg border" onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ValuationModal;
