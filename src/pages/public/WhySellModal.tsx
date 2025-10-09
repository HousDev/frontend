import React from "react";
import { CheckCircle2, X } from "lucide-react";
import Modal from "@/components/ui/Modal";

type WhySellModalProps = {
    open: boolean;        // <-- aap HomePage se 'open' bhej rahe ho, ye theek hai
    onClose: () => void;
};

const BRAND = { primary: "#E6761D" };

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition">
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#E6761D]" />
        <span className="text-gray-800 text-sm sm:text-base">{children}</span>
    </li>
);

const WhySellModal: React.FC<WhySellModalProps> = ({ open, onClose }) => {
    return (
        <Modal
            isOpen={open}             // ✅ fix: 'open' -> 'isOpen'
            onClose={onClose}
            title="Why Sell with Resale Expert?"
        >
            <div className="relative">

                {/* Hero */}
                <div
                    className="relative p-6 sm:p-8"
                    style={{
                        background:
                            "radial-gradient(120% 120% at 10% 0%, #FFE7D3 0%, #FFF6EF 45%, white 100%)",
                    }}
                >
                    <h3 className="text-lg sm:text-xl font-semibold">Sell Faster. Sell Smarter.</h3>
                    <p className="text-black text-sm sm:text-base mt-1">
                        We combine data-driven pricing, verified demand, and full support to maximize your resale value.
                    </p>
                </div>

                {/* Points */}
                <ul className="space-y-3">
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
                        <strong>Trusted Experts:</strong> Pune’s leading resale property advisors.
                    </Bullet>
                </ul>

                {/* CTA */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="px-2 py-2 rounded-lg text-white font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 transition"
                        style={{ backgroundColor: BRAND.primary }}
                    >
                        Get Free Valuation
                    </button>
                    <button
                        onClick={onClose}
                        className="px-2 py-2 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition"
                    >
                        Maybe Later
                    </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                    *No spam. No hidden charges. Just expert guidance tailored to you.
                </div>
            </div>
        </Modal>
    );
};

export default WhySellModal;
