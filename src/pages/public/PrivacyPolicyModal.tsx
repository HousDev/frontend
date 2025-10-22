// src/components/modals/PrivacyPolicyModal.tsx
import React from "react";
import { X } from "lucide-react";

interface PrivacyPolicyModalProps {
    open: boolean;
    onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] rounded-2xl shadow-2xl overflow-hidden animate-fadeIn relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-100 sticky top-0 z-10">
                    <h2 className="text-2xl font-semibold text-gray-800">Privacy Policy</h2>
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
                        <strong>Effective Date:</strong> 24/06/2023
                    </p>

                    <p>
                        At <strong className="text-[#E6761D]">resaleexpert.in</strong>, we are committed to protecting the privacy of our
                        users in accordance with the applicable laws and regulations of India. This Privacy
                        Policy outlines how we collect, use, and protect the information provided by users of our
                        website.
                    </p>

                    <ol className="list-decimal pl-8 space-y-3">
                        <li>
                            <strong>Collection of Personal Information:</strong> We may collect personal
                            information from users, including but not limited to names, email addresses, contact
                            numbers, and other details provided voluntarily.
                        </li>
                        <li>
                            <strong>Use of Personal Information:</strong> The collected data helps us provide and
                            improve our services, respond to inquiries, and send promotional offers with user
                            consent.
                        </li>
                        <li>
                            <strong>Information Sharing:</strong> We may share data with trusted partners and
                            service providers but never sell or rent information without user consent.
                        </li>
                        <li>
                            <strong>Data Security:</strong> We implement appropriate measures to protect your
                            information in accordance with Indian data protection laws.
                        </li>
                        <li>
                            <strong>Cookies and Tracking Technologies:</strong> Cookies may be used to enhance user
                            experience and analyze website traffic.
                        </li>
                        <li>
                            <strong>Third-Party Websites:</strong> Our website may contain external links; we are
                            not responsible for their privacy practices.
                        </li>
                        <li>
                            <strong>Children’s Privacy:</strong> Our services are not intended for children under
                            18. We do not knowingly collect data from minors.
                        </li>
                        <li>
                            <strong>Changes to this Policy:</strong> We may update this Privacy Policy
                            periodically. Users are encouraged to review it regularly.
                        </li>
                        <li>
                            <strong>Contact Us:</strong> For questions, email us at{" "}
                            <a
                                href="mailto:admin@resaleexpert.in"
                                className="text-[#E6761D] underline"
                            >
                                admin@resaleexpert.in
                            </a>
                            .
                        </li>
                    </ol>

                    <p className="pt-2 text-gray-600">
                        By using resaleexpert.in, you acknowledge that you have read, understood, and agreed to
                        this Privacy Policy under the laws of India.
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

export default PrivacyPolicyModal;
