// import React, { useEffect, useMemo, useState } from "react";
// import { Loader2 } from "lucide-react";
// import Modal from "@/components/ui/Modal";
// import { getMasterDropdownOptions, type MasterOption } from "@/lib/useMasterData";
// import { toast } from "react-toastify";
// import valuationAPI from "@/lib/valuationAPI";

// /* -------------------------------------------------------------------------- */
// /* Types                                                                      */
// /* -------------------------------------------------------------------------- */
// interface Props {
//     open: boolean;
//     onClose: () => void;
//     onListProperty: () => void;
// }
// type Step = 1 | 2;
// type Masters = Record<string, MasterOption[]>;

// type EstimateResult = {
//     low: number;
//     high: number;
//     ppsf: number;
//     confidence: "Low" | "Medium" | "High";
//     comps: Array<{ society: string; distance_km: number; month: string; price: number }>;
// };

// type FormState = {
//     fullName: string;
//     phone: string;
//     email: string;
//     type: string;
//     unitType: string;
//     society: string;
//     location: string;
//     carpet: string;
// };

// /* -------------------------------------------------------------------------- */
// /* Helpers                                                                    */
// /* -------------------------------------------------------------------------- */
// const formatINR = (n?: number) =>
//     typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "-";

// const requiredFilled = (f: FormState) =>
//     !!f.fullName &&
//     !!f.phone &&
//     !!f.email &&
//     !!f.type &&
//     !!f.unitType &&
//     !!f.society &&
//     !!f.location &&
//     !!f.carpet;

// const emailValid = (s: string) => /^\S+@\S+\.\S+$/.test(s);
// const phoneDigits = (s: string) => s.replace(/[^\d]/g, "");

// /* -------------------------------------------------------------------------- */
// /* Component                                                                  */
// /* -------------------------------------------------------------------------- */
// const ValuationModal: React.FC<Props> = ({ open, onClose, onListProperty }) => {
//     const [step, setStep] = useState<Step>(1);
//     const [loading, setLoading] = useState(false);
//     const [masterLoading, setMasterLoading] = useState(true);
//     const [masters, setMasters] = useState<Masters>({});

//     const [form, setForm] = useState<FormState>({
//         fullName: "",
//         phone: "",
//         email: "",
//         type: "",
//         unitType: "",
//         society: "",
//         location: "",
//         carpet: "",
//     });

//     const [result, setResult] = useState<EstimateResult | null>(null);

//     // reset on open
//     useEffect(() => {
//         if (!open) return;
//         setStep(1);
//         setResult(null);
//     }, [open]);

//     // flatten master helper
//     const flattenMasters = (data: any): Masters => {
//         const flat: Masters = {};
//         const walk = (obj: any) => {
//             if (!obj || typeof obj !== "object") return;
//             Object.entries(obj).forEach(([k, v]) => {
//                 if (Array.isArray(v)) flat[String(k).toLowerCase()] = v as MasterOption[];
//                 else if (v && typeof v === "object") walk(v);
//             });
//         };
//         walk(data);
//         return flat;
//     };

//     // fetch masters
//     useEffect(() => {
//         if (!open) return;
//         const fetchMasters = async () => {
//             try {
//                 setMasterLoading(true);
//                 const raw = await getMasterDropdownOptions(["common", "property"]);
//                 const flat = flattenMasters(raw);
//                 const needed: Masters = {
//                     "property type": flat["property type"] || [],
//                     "unit type": flat["unit type"] || [],
//                 };
//                 setMasters(needed);
//             } catch {
//                 toast.error("Failed to load options");
//             } finally {
//                 setMasterLoading(false);
//             }
//         };
//         fetchMasters();
//     }, [open]);

//     // filter unitType by property type (simple contains rule)
//     const unitTypeOptions = useMemo(() => {
//         const all = masters["unit type"] || [];
//         if (!form.type) return all;
//         const filtered = all.filter((u) =>
//             u.label.toLowerCase().includes(form.type.toLowerCase())
//         );
//         return filtered.length ? filtered : all;
//     }, [masters, form.type]);

//     // go straight to estimate (2-step flow)
//     const handleContinue = () => {
//         if (!requiredFilled(form)) return toast.info("Please fill all required fields.");
//         if (!emailValid(form.email)) return toast.info("Please enter a valid email address.");
//         const p = phoneDigits(form.phone);
//         if (p.length < 10) return toast.info("Please enter a valid 10-digit phone number.");
//         handleEstimate();
//     };

//     const handleEstimate = async () => {
//         setLoading(true);
//         try {
//             const payload = {
//                 locality: form.location,
//                 propertyType: form.type,
//                 unitType: form.unitType,
//                 carpet_sqft: form.carpet ? Number(form.carpet) : undefined,
//                 contact: {
//                     name: form.fullName,
//                     phone: phoneDigits(form.phone),
//                     email: form.email,
//                 },
//                 society: form.society,
//             };

//             const res = await valuationAPI.estimate(payload as any);
//             const data = (res as any).data ?? res;
//             if (!data) throw new Error("Estimation failed");

//             setResult(data as EstimateResult);
//             setStep(2);
//         } catch (e: any) {
//             toast.error(e?.message || "Estimation failed");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Modal
//             isOpen={open}
//             onClose={onClose}
//             title="Free Instant Property Valuation"
//             /* 👇 give the modal enough width for 3 columns on large screens */
//             width="max-w-[95vw] md:max-w-3xl lg:max-w-5xl"
//         >
//             <div className="text-gray-800 max-w-5xl w-full">
//                 <p className="text-xs text-gray-500 -mt-2 mb-3">
//                     AI-powered estimate in under 30 seconds
//                 </p>

//                 {/* Stepper */}
//                 <div className="px-1 pt-1 mb-3">
//                     <div className="flex items-center justify-between text-sm">
//                         {[
//                             { n: 1 as Step, label: "Property Details" },
//                             { n: 2 as Step, label: "Estimate" },
//                         ].map((s, idx) => {
//                             const active = step === s.n;
//                             const done = step > s.n;
//                             return (
//                                 <div key={idx} className="flex-1 flex items-center">
//                                     <div
//                                         className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs mr-2 ${done
//                                                 ? "bg-green-600 text-white border-green-600"
//                                                 : active
//                                                     ? "bg-[#E6761D] text-white border-[#E6761D]"
//                                                     : "bg-white text-gray-600 border-gray-300"
//                                             }`}
//                                     >
//                                         {s.n}
//                                     </div>
//                                     <span
//                                         className={`${active ? "text-gray-900 font-medium" : "text-gray-500"
//                                             } mr-2`}
//                                     >
//                                         {s.label}
//                                     </span>
//                                     {idx === 0 && <div className="flex-1 h-px bg-gray-200" />}
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* Body */}
//                 {step === 1 && (
//                     <div className="space-y-4">
//                         {/* 👇 1-col mobile, 2-col tablet, 3-col desktop */}
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
//                             <div>
//                                 <label className="text-sm text-gray-800">Full Name *</label>
//                                 <input
//                                     className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
//                                     placeholder="e.g. Kamlesh Shah"
//                                     value={form.fullName}
//                                     onChange={(e) => setForm({ ...form, fullName: e.target.value })}
//                                 />
//                             </div>
//                             <div>
//                                 <label className="text-sm text-gray-800">Phone *</label>
//                                 <input
//                                     className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
//                                     inputMode="numeric"
//                                     placeholder="e.g. 98XXXXXXXX"
//                                     value={form.phone}
//                                     onChange={(e) => setForm({ ...form, phone: phoneDigits(e.target.value) })}
//                                 />
//                             </div>
//                             <div>
//                                 <label className="text-sm text-gray-800">Email *</label>
//                                 <input
//                                     className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
//                                     type="email"
//                                     placeholder="e.g. you@domain.com"
//                                     value={form.email}
//                                     onChange={(e) => setForm({ ...form, email: e.target.value })}
//                                 />
//                             </div>
//                             <div>
//                                 <label className="text-sm text-gray-800">Property Type *</label>
//                                 <select
//                                     className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
//                                     value={form.type}
//                                     onChange={(e) => setForm({ ...form, type: e.target.value, unitType: "" })}
//                                 >
//                                     <option value="">Select</option>
//                                     {(masters["property type"] || []).map((t) => (
//                                         <option key={t.value} value={t.value}>
//                                             {t.label}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="text-sm text-gray-800">Unit Type *</label>
//                                 <select
//                                     className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
//                                     value={form.unitType}
//                                     onChange={(e) => setForm({ ...form, unitType: e.target.value })}
//                                 >
//                                     <option value="">Select</option>
//                                     {unitTypeOptions.map((u) => (
//                                         <option key={u.value} value={u.value}>
//                                             {u.label}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="text-sm text-gray-800">Society *</label>
//                                 <input
//                                     className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
//                                     placeholder="e.g. Kumar Primavera"
//                                     value={form.society}
//                                     onChange={(e) => setForm({ ...form, society: e.target.value })}
//                                 />
//                             </div>
//                             <div>
//                                 <label className="text-sm text-gray-800">Location *</label>
//                                 <input
//                                     className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
//                                     placeholder="e.g. Viman Nagar, Pune"
//                                     value={form.location}
//                                     onChange={(e) => setForm({ ...form, location: e.target.value })}
//                                 />
//                             </div>
//                             <div>
//                                 <label className="text-sm text-gray-800">Carpet Area (sqft) *</label>
//                                 <input
//                                     className="w-full mt-1 border rounded-lg p-2 text-sm text-gray-800"
//                                     inputMode="numeric"
//                                     placeholder="e.g. 925"
//                                     value={form.carpet}
//                                     onChange={(e) =>
//                                         setForm({ ...form, carpet: e.target.value.replace(/[^\d.]/g, "") })
//                                     }
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {step === 2 && result && (
//                     <div className="space-y-5 text-gray-800">
//                         <div className="bg-gray-50 border rounded-xl p-4">
//                             <div className="text-sm text-gray-600">Estimated Price Range</div>
//                             <div className="text-xl font-bold text-gray-800 mt-1">
//                                 {formatINR(result.low)} – {formatINR(result.high)}
//                             </div>
//                             <div className="text-xs text-gray-600 mt-1">Confidence: {result.confidence}</div>
//                             <div className="text-xs text-gray-600">Avg PPSF: {formatINR(result.ppsf)}</div>
//                         </div>
//                     </div>
//                 )}

//                 {step === 2 && !result && loading && (
//                     <div className="flex items-center justify-center py-12 text-gray-600">
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Estimating…
//                     </div>
//                 )}

//                 {/* Footer Actions */}
//                 <div className="mt-6 border-t pt-3">
//                     {step === 1 && (
//                         <div className="flex justify-end gap-2">
//                             <button className="px-4 py-2 rounded-lg border text-gray-800" onClick={onClose}>
//                                 Cancel
//                             </button>
//                             <button
//                                 className="px-4 py-2 rounded-lg bg-[#E6761D] text-white"
//                                 onClick={handleContinue}
//                                 disabled={masterLoading || loading}
//                             >
//                                 Continue
//                             </button>
//                         </div>
//                     )}

//                     {step === 2 && (
//                         <div className="flex flex-wrap justify-end gap-2">
//                             <button className="border rounded-lg px-4 py-2 text-gray-800" onClick={onListProperty}>
//                                 List My Property
//                             </button>
//                             <button
//                                 className="bg-[#E6761D] text-white rounded-lg px-4 py-2"
//                                 onClick={() => toast.info("Generating detailed PDF report…")}
//                             >
//                                 Download Report (PDF)
//                             </button>
//                             <button
//                                 className="border rounded-lg px-4 py-2 text-gray-800"
//                                 onClick={() => toast.success("Our executive will contact you.")}
//                             >
//                                 Schedule Visit
//                             </button>
//                             <button className="border rounded-lg px-4 py-2 text-gray-800" onClick={onClose}>
//                                 Close
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </Modal>
//     );
// };

// export default ValuationModal;



import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Home, Download, CalendarCheck, X } from "lucide-react";
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
    !!f.fullName && !!f.phone && !!f.email && !!f.type &&
    !!f.unitType && !!f.society && !!f.location && !!f.carpet;

const emailValid = (s: string) => /^\S+@\S+\.\S+$/.test(s);
const phoneDigits = (s: string) => s.replace(/[^\d]/g, "");

const CONF_WIDTH: Record<string, string> = { Low: "33%", Medium: "66%", High: "100%" };
const CONF_COLOR: Record<string, string> = { Low: "#f59e0b", Medium: "#3b82f6", High: "#16a34a" };

/* -------------------------------------------------------------------------- */
/* Design tokens (outside component — stable references, no remount)          */
/* -------------------------------------------------------------------------- */
const brand = "#E6761D";
const navy = "#1a2b3c";
const surface = "#f8f9fa";
const border = "#e4e7eb";
const muted = "#6b7280";
const textColor = "#1a1f2e";

const inputCls =
    "w-full border rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none transition-all " +
    "focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] placeholder:text-gray-400";
const labelCls = "block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <label className={labelCls}>{label} <span className="text-red-500">*</span></label>
        {children}
    </div>
);

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
const ValuationModal: React.FC<Props> = ({ open, onClose, onListProperty }) => {
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [masterLoading, setMasterLoading] = useState(true);
    const [masters, setMasters] = useState<Masters>({});

    const [form, setForm] = useState<FormState>({
        fullName: "", phone: "", email: "", type: "",
        unitType: "", society: "", location: "", carpet: "",
    });

    const [result, setResult] = useState<EstimateResult | null>(null);

    useEffect(() => {
        if (!open) return;
        setStep(1);
        setResult(null);
    }, [open]);

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

    useEffect(() => {
        if (!open) return;
        (async () => {
            try {
                setMasterLoading(true);
                const raw = await getMasterDropdownOptions(["common", "property"]);
                const flat = flattenMasters(raw);
                setMasters({
                    "property type": flat["property type"] || [],
                    "unit type": flat["unit type"] || [],
                });
            } catch {
                toast.error("Failed to load options");
            } finally {
                setMasterLoading(false);
            }
        })();
    }, [open]);

    const unitTypeOptions = useMemo(() => {
        const all = masters["unit type"] || [];
        if (!form.type) return all;
        const filtered = all.filter((u) => u.label.toLowerCase().includes(form.type.toLowerCase()));
        return filtered.length ? filtered : all;
    }, [masters, form.type]);

    const handleContinue = () => {
        if (!requiredFilled(form)) return toast.info("Please fill all required fields.");
        if (!emailValid(form.email)) return toast.info("Please enter a valid email address.");
        if (phoneDigits(form.phone).length < 10) return toast.info("Please enter a valid 10-digit phone number.");
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
                contact: { name: form.fullName, phone: phoneDigits(form.phone), email: form.email },
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

    if (!open) return null;

    return (
        /* Overlay */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
            style={{ background: "rgba(15,27,40,0.65)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal shell */}
            <div
                className="relative w-full flex flex-col overflow-hidden"
                style={{
                    maxWidth: 820, maxHeight: "95vh",
                    background: "#fff", borderRadius: 16,
                    boxShadow: "0 16px 60px rgba(0,0,0,0.18)",
                    border: `1px solid ${border}`,
                }}
            >
                {/* ── Custom Header ── */}
                <div
                    className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${navy} 0%, #2d3f52 100%)` }}
                >
                    <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(230,118,29,0.18)" }}
                    >
                        <Home size={18} color={brand} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-[14px] leading-tight">
                            Free Instant Property Valuation
                        </div>
                        <div className="text-white/60 text-[11px] mt-0.5">
                            AI-powered estimate in under 30 seconds
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                    >
                        <X size={15} color="#fff" />
                    </button>
                </div>

                {/* ── Stepper ── */}
                <div
                    className="flex items-center px-5 py-2.5 flex-shrink-0"
                    style={{ borderBottom: `1px solid ${border}`, background: "#fff" }}
                >
                    {[
                        { n: 1 as Step, label: "Property Details" },
                        { n: 2 as Step, label: "Estimate" },
                    ].map((s, idx) => {
                        const active = step === s.n;
                        const done = step > s.n;
                        return (
                            <React.Fragment key={s.n}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                                        style={{
                                            width: 26, height: 26, borderRadius: "50%",
                                            background: done ? "#16a34a" : active ? brand : "transparent",
                                            color: done || active ? "#fff" : muted,
                                            border: `2px solid ${done ? "#16a34a" : active ? brand : border}`,
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        {done ? "✓" : s.n}
                                    </div>
                                    <span
                                        className="text-[11px] font-semibold whitespace-nowrap"
                                        style={{ color: active ? textColor : muted }}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                                {idx === 0 && (
                                    <div
                                        className="flex-1 mx-3"
                                        style={{
                                            height: 1,
                                            background: step === 2 ? brand : border,
                                            transition: "background 0.3s",
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "thin" }}>

                    {/* Step 1 — Form */}
                    {step === 1 && (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <Field label="Full Name">
                                <input
                                    className={inputCls}
                                    placeholder="e.g. Rahul Sharma"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                />
                            </Field>
                            <Field label="Phone">
                                <input
                                    className={inputCls}
                                    inputMode="numeric"
                                    placeholder="e.g. 98XXXXXXXX"
                                    maxLength={10}
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: phoneDigits(e.target.value) })}
                                />
                            </Field>
                            <Field label="Email">
                                <input
                                    className={inputCls}
                                    type="email"
                                    placeholder="e.g. you@domain.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </Field>
                            <Field label="Property Type">
                                <select
                                    className={inputCls}
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value, unitType: "" })}
                                >
                                    <option value="">Select</option>
                                    {(masters["property type"] || []).map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Unit Type">
                                <select
                                    className={inputCls}
                                    value={form.unitType}
                                    onChange={(e) => setForm({ ...form, unitType: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    {unitTypeOptions.map((u) => (
                                        <option key={u.value} value={u.value}>{u.label}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Society">
                                <input
                                    className={inputCls}
                                    placeholder="e.g. Kumar Primavera"
                                    value={form.society}
                                    onChange={(e) => setForm({ ...form, society: e.target.value })}
                                />
                            </Field>
                            <Field label="Location">
                                <input
                                    className={inputCls}
                                    placeholder="e.g. Viman Nagar, Pune"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                />
                            </Field>
                            <Field label="Carpet Area (sqft)">
                                <input
                                    className={inputCls}
                                    inputMode="numeric"
                                    placeholder="e.g. 925"
                                    value={form.carpet}
                                    onChange={(e) => setForm({ ...form, carpet: e.target.value.replace(/[^\d.]/g, "") })}
                                />
                            </Field>
                        </div>
                    )}

                    {/* Step 2 — Result */}
                    {step === 2 && result && (
                        <div className="space-y-4">
                            {/* Price range card */}
                            <div
                                className="rounded-xl p-4"
                                style={{ background: "#FFF4EC", border: `1.5px solid rgba(230,118,29,0.25)` }}
                            >
                                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Estimated Price Range
                                </div>
                                <div className="text-2xl font-bold" style={{ color: brand }}>
                                    {formatINR(result.low)} – {formatINR(result.high)}
                                </div>
                                {/* Confidence bar */}
                                <div className="mt-3 mb-2">
                                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                        <span>Confidence</span>
                                        <span className="font-semibold" style={{ color: CONF_COLOR[result.confidence] }}>
                                            {result.confidence}
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full" style={{ background: border }}>
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: CONF_WIDTH[result.confidence],
                                                background: CONF_COLOR[result.confidence],
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span
                                        className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                                        style={{ background: "rgba(230,118,29,0.12)", color: brand }}
                                    >
                                        Avg PPSF: {formatINR(result.ppsf)}
                                    </span>
                                </div>
                            </div>

                            {/* Comps table */}
                            {result.comps?.length > 0 && (
                                <div
                                    className="rounded-xl overflow-hidden"
                                    style={{ border: `1px solid ${border}` }}
                                >
                                    <div
                                        className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500"
                                        style={{ background: surface, borderBottom: `1px solid ${border}` }}
                                    >
                                        Comparable Sales
                                    </div>
                                    <div className="divide-y" style={{ borderColor: border }}>
                                        {result.comps.map((c, i) => (
                                            <div key={i} className="flex items-center justify-between px-4 py-2.5">
                                                <div>
                                                    <div className="text-[13px] font-medium text-gray-800">{c.society}</div>
                                                    <div className="text-[11px] text-gray-500">
                                                        {c.distance_km} km away · {c.month}
                                                    </div>
                                                </div>
                                                <div className="text-[13px] font-bold" style={{ color: brand }}>
                                                    {formatINR(c.price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading */}
                    {step === 2 && !result && loading && (
                        <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-500">
                            <Loader2 className="animate-spin" size={32} color={brand} />
                            <span className="text-[13px]">Estimating your property value…</span>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 flex-shrink-0"
                    style={{ borderTop: `1px solid ${border}`, background: surface }}
                >
                    {/* AI badge */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span
                            className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                            style={{ background: "#16a34a" }}
                        />
                        AI-powered
                    </div>

                    {step === 1 && (
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 rounded-lg text-[12px] font-semibold border transition-colors"
                                style={{ borderColor: border, color: textColor, background: "transparent" }}
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1 transition-opacity disabled:opacity-50"
                                style={{ background: brand, border: "none" }}
                                onClick={handleContinue}
                                disabled={masterLoading || loading}
                            >
                                {loading && <Loader2 size={13} className="animate-spin" />}
                                Continue →
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                className="px-4 py-2 rounded-lg text-[12px] font-semibold border transition-colors"
                                style={{ borderColor: border, color: textColor, background: "transparent" }}
                                onClick={() => { setStep(1); setResult(null); }}
                            >
                                ← Back
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg text-[12px] font-semibold border transition-colors flex items-center gap-1.5"
                                style={{ borderColor: brand, color: brand, background: "transparent" }}
                                onClick={() => toast.success("Our executive will contact you.")}
                            >
                                <CalendarCheck size={13} /> Schedule Visit
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg text-[12px] font-semibold border transition-colors"
                                style={{ borderColor: brand, color: brand, background: "transparent" }}
                                onClick={onListProperty}
                            >
                                List My Property
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 transition-opacity"
                                style={{ background: brand, border: "none" }}
                                onClick={() => toast.info("Generating detailed PDF report…")}
                            >
                                <Download size={13} /> Download PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ValuationModal;