

// // src/pages/WhySellModal.tsx
// import React from "react";
// import { CheckCircle2 } from "lucide-react";
// import Modal from "@/components/ui/Modal";

// type WhySellModalProps = {
//     open: boolean;          // from HomePage
//     onClose: () => void;
//     onFreeValuation: () => void; // ✅ NEW: tell parent to open ValuationModal
// };

// const BRAND = { primary: "#E6761D" };

// const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//     <li className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition">
//         <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#E6761D]" />
//         <span className="text-gray-800 text-sm sm:text-base">{children}</span>
//     </li>
// );

// const WhySellModal: React.FC<WhySellModalProps> = ({ open, onClose, onFreeValuation }) => {
//     return (
//         <Modal
//             isOpen={open}            // ✅ correct prop for your Modal wrapper
//             onClose={onClose}
//             title="Why Sell with Resale Expert?"
//             width="max-w-[95vw] md:max-w-2xl lg:max-w-5xl"
//         >
//             <div className="relative">
//                 {/* Hero */}
//                 <div
//                     className="relative p-6 sm:p-8"
//                     style={{
//                         background:
//                             "radial-gradient(120% 120% at 10% 0%, #FFE7D3 0%, #FFF6EF 45%, white 100%)",
//                     }}
//                 >
//                     <h3 className="text-lg sm:text-xl font-semibold">Sell Faster. Sell Smarter.</h3>
//                     <p className="text-black text-sm sm:text-base mt-1">
//                         We combine data-driven pricing, verified demand, and full support to maximize your resale value.
//                     </p>
//                 </div>

//                 {/* Points */}
//                 <ul className="space-y-3">
//                     <Bullet>
//                         <strong>AI-Based Valuation:</strong> Get an accurate resale price instantly.
//                     </Bullet>
//                     <Bullet>
//                         <strong>Verified Buyers Only:</strong> Serious buyers, no time-wasters.
//                     </Bullet>
//                     <Bullet>
//                         <strong>Zero Listing Fees:</strong> List your property free of cost.
//                     </Bullet>
//                     <Bullet>
//                         <strong>Full Support:</strong> From paperwork to home loan assistance.
//                     </Bullet>
//                     <Bullet>
//                         <strong>Trusted Experts:</strong> Pune’s leading resale property advisors.
//                     </Bullet>
//                 </ul>

//                 {/* CTA */}
//                 <div className="mt-6 flex flex-col sm:flex-row gap-3">
//                     <button
//                         onClick={() => {
//                             onClose();          // close this modal first
//                             onFreeValuation();  // ✅ open valuation modal in parent
//                         }}
//                         className="px-2 py-2 rounded-lg text-white font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 transition"
//                         style={{ backgroundColor: BRAND.primary }}
//                     >
//                         Get Free Valuation
//                     </button>
//                     <button
//                         onClick={onClose}
//                         className="px-2 py-2 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition"
//                     >
//                         Maybe Later
//                     </button>
//                 </div>

//                 <div className="mt-4 text-xs text-gray-500">
//                     *No spam. No hidden charges. Just expert guidance tailored to you.
//                 </div>
//             </div>
//         </Modal>
//     );
// };

// export default WhySellModal;


import React from "react";
import { CheckCircle2, Home, X } from "lucide-react";

type WhySellModalProps = {
    open: boolean;
    onClose: () => void;
    onFreeValuation: () => void;
};

/* -------------------------------------------------------------------------- */
/* Sub-components — defined OUTSIDE to prevent remount on re-render           */
/* -------------------------------------------------------------------------- */
const navy = "#1a2b3c";
const brand = "#E6761D";
const surface = "#f8f9fa";
const border = "#e4e7eb";

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li
        className="flex items-start gap-3 rounded-xl transition-all"
        style={{
            padding: "10px 12px",
            border: `1px solid ${border}`,
            background: "#fff",
        }}
        onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db";
            (e.currentTarget as HTMLElement).style.background = "#fafafa";
        }}
        onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = border;
            (e.currentTarget as HTMLElement).style.background = "#fff";
        }}
    >
        <CheckCircle2
            className="shrink-0 mt-0.5"
            size={17}
            style={{ color: brand }}
        />
        <span className="text-gray-800 text-[13px] leading-relaxed">{children}</span>
    </li>
);

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
const WhySellModal: React.FC<WhySellModalProps> = ({ open, onClose, onFreeValuation }) => {
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
                    maxWidth: 560,
                    background: "#fff",
                    borderRadius: 16,
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
                        style={{
                            width: 36, height: 36, borderRadius: 9,
                            background: "rgba(230,118,29,0.18)",
                        }}
                    >
                        <Home size={17} color={brand} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-[14px] leading-tight">
                            Why Sell with Resale Expert?
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                            Pune's leading resale property advisors
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: "rgba(255,255,255,0.08)",
                            border: "none", cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)")
                        }
                        onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")
                        }
                    >
                        <X size={13} color="#fff" />
                    </button>
                </div>

                {/* ── Hero strip ── */}
                <div
                    className="px-5 py-4 flex-shrink-0"
                    style={{
                        background: "#FFF4EC",
                        borderBottom: `1px solid #ffe0c8`,
                    }}
                >
                    <h3 className="text-[15px] font-bold text-gray-900">
                        Sell Faster. Sell Smarter.
                    </h3>
                    <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                        We combine data-driven pricing, verified demand, and full support to maximize your resale value.
                    </p>
                </div>

                {/* ── Bullet points ── */}
                <ul className="px-5 py-4 space-y-2 flex-shrink-0">
                    <Bullet>
                        <strong>AI-Based Valuation:</strong> Get an accurate resale price instantly.
                    </Bullet>
                    <Bullet>
                        <strong>Verified Buyers Only:</strong> Serious buyers, no time-wasters.
                    </Bullet>
                    <Bullet>
                        <strong>Zero Listing Fees:</strong> List your property free of cost.
                    </Bullet>
                    <Bullet>
                        <strong>Full Support:</strong> From paperwork to home loan assistance.
                    </Bullet>
                    <Bullet>
                        <strong>Trusted Experts:</strong> Pune's leading resale property advisors.
                    </Bullet>
                </ul>

                {/* ── Footer ── */}
                <div
                    className="px-5 py-3 flex flex-wrap gap-2 flex-shrink-0"
                    style={{ borderTop: `1px solid ${border}`, background: surface }}
                >
                    <button
                        onClick={() => { onClose(); onFreeValuation(); }}
                        className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: brand, border: "none", cursor: "pointer" }}
                    >
                        Get Free Valuation
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                        style={{ border: `1.5px solid ${border}`, background: "transparent", cursor: "pointer" }}
                    >
                        Maybe Later
                    </button>
                </div>

                {/* ── Disclaimer ── */}
                <div className="px-5 pb-3 text-[11px] text-gray-400">
                    *No spam. No hidden charges. Just expert guidance tailored to you.
                </div>
            </div>
        </div>
    );
};

export default WhySellModal;