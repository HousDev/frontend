// src/components/modals/TermsConditionsModal.tsx
import React from "react";
import { X } from "lucide-react";

interface TermsConditionsModalProps {
    open: boolean;
    onClose: () => void;
}

const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] rounded-2xl shadow-2xl overflow-hidden animate-fadeIn relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-100 sticky top-0 z-10">
                    <h2 className="text-2xl font-semibold text-gray-800">Terms &amp; Conditions</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-700" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[80vh] overflow-y-auto text-gray-700 text-base leading-relaxed space-y-5">
                    <p>
                        Welcome to <strong className="text-[#E6761D]">resaleexpert.in</strong>. By accessing or using our website, you agree
                        to comply with and be bound by the following terms and conditions.
                    </p>

                    <p>
                        These Terms govern your use of our website and services. Please read them carefully
                        before using resaleexpert.in.
                    </p>

                    <ul className="list-disc pl-8 space-y-3">
                        <li>
                            Use of the website is subject to compliance with applicable laws and regulations of
                            India.
                        </li>
                        <li>
                            All content and materials on this website are the property of{" "}
                            <strong className="text-[#E6761D]">resaleexpert.in</strong> and may not be copied or redistributed without written
                            consent.
                        </li>
                        <li>
                            We reserve the right to modify, suspend, or discontinue any part of the website without
                            prior notice.
                        </li>
                        <li>
                            Users are responsible for maintaining confidentiality of login credentials and any
                            activities under their account.
                        </li>
                        <li>
                            We shall not be liable for any loss or damage resulting from the use of this website or
                            reliance on any information provided herein.
                        </li>
                        <li>
                            Links to third-party websites are provided for convenience; we do not endorse their
                            content or privacy practices.
                        </li>
                        <li>
                            These terms are governed by and construed under the laws of India. Any disputes shall
                            be subject to the jurisdiction of Pune courts.
                        </li>
                    </ul>

                    <p>
                        By continuing to use our services, you acknowledge that you have read and agreed to these
                        Terms &amp; Conditions.
                    </p>

                    {/* Footer Close Button */}
                    <div className="flex justify-end pt-6 border-t">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-[#E6761D] text-white rounded-lg hover:bg-[#d1651a] transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsConditionsModal;
