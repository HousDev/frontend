// ContactQuickModal.tsx
import React from "react";
import { X, Clock, Phone } from "lucide-react";
import ChatbotLogo from "@/assets/images/RE.png";

type Props = {
    open: boolean;
    onClose: () => void;
    title?: string;

    // phone
    phoneE164?: string;      // e.g. +919637009639
    displayPhone?: string;   // e.g. +91 9637 00 9639

    // ui copy
    availabilityText?: string;

    // NEW: prefill support (OPTIONAL)
    initialSubject?: string;                 // e.g. "Property Selling"
    presetMessage?: string;                  // e.g. "I'm interested in …"
    meta?: Record<string, any> | null;       // e.g. { source:'services_page', serviceId:'property-selling' }
};

const ContactQuickModal: React.FC<Props> = ({
    open,
    onClose,
    title = "Talk to an Expert",
    phoneE164 = "+919637009639",
    displayPhone = "+91 9637 00 9639",
    availabilityText = "Available 9:00 AM – 9:00 PM (IST)",

    // new
    initialSubject = "",
    presetMessage = "",
    meta = null,
}) => {
    if (!open) return null;

    const numberDigits = phoneE164.replace(/\D/g, "");
    const telLink = `tel:${phoneE164}`;

    // Build WA text with prefill + meta
    const buildWaText = () => {
        const bodyPart =
            (presetMessage && presetMessage.trim()) ||
            "Hi team, I'm interested in your services. Please guide me.";
        return encodeURIComponent(bodyPart);
    };


    const waHref = `https://wa.me/${numberDigits}?text=${buildWaText()}`;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            onClick={onClose}
        >
            {/* Card */}
            <div
                className="w-full max-w-sm bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-xl overflow-hidden transform transition-all animate-[slideUp_0.25s_ease] relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Orbs */}
                <div className="pointer-events-none absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl" />
                <div className="pointer-events-none absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-2xl" />

                {/* Header */}
                <div className="relative flex items-center justify-between px-4 py-3 border-b border-white-200/60 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow">
                            <img src={ChatbotLogo} alt="RE" className="w-7 h-7 object-contain" />
                        </div>
                        <h3 id="contact-modal-title" className="text-base font-semibold text-gray-900">
                            {title}
                        </h3>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-200/70 rounded-full transition-all duration-200 hover:rotate-90"
                        aria-label="Close"
                    >
                        <X size={16} className="text-gray-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="relative px-4 py-4 space-y-4">
                    {(initialSubject || presetMessage) && (
                        <div className="rounded-lg border border-indigo-100 bg-white/70 px-3 py-2">
                            {initialSubject && (
                                <div className="text-[11px] font-semibold text-indigo-700">
                                    Service:&nbsp;<span className="font-bold">{initialSubject}</span>
                                </div>
                            )}
                            {presetMessage && (
                                <div className="text-[11px] text-gray-600 mt-0.5">
                                    {presetMessage}
                                </div>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-gray-600 leading-relaxed text-center">
                        Choose your preferred way to reach us. We're here to help and usually respond within minutes.
                    </p>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* WhatsApp */}
                        <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500/40"
                            aria-label="Chat on WhatsApp"
                        >
                            <div className="relative px-2.5 py-1.5 flex flex-col items-center justify-center gap-0.5 text-white">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <svg className="w-4 h-4 relative z-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.051 22a9.87 9.87 0 0 1-5.396-1.592l-3.725.979 1-3.653A9.86 9.86 0 0 1 2 11.892C2 6.34 6.44 1.9 12 1.9s10 4.44 10 9.992C22 17.44 17.56 22 12.051 22Z" />
                                </svg>
                                <span className="text-[11px] font-medium relative z-10">WhatsApp</span>
                            </div>
                        </a>

                        {/* Call Now */}
                        <a
                            href={telLink}
                            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            aria-label={`Call ${displayPhone}`}
                        >
                            <div className="relative px-2.5 py-1.5 flex flex-col items-center justify-center gap-0.5 text-white">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Phone className="w-4 h-4 relative z-10" />
                                <span className="text-[11px] font-medium relative z-10">Call Now</span>
                            </div>
                        </a>
                    </div>

                    {/* Phone */}
                    <div className="text-center">
                        <a
                            href={telLink}
                            className="inline-block text-base font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                        >
                            {displayPhone}
                        </a>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <Clock size={14} className="text-indigo-600" />
                        <span className="text-[11px] font-medium text-gray-700">
                            {availabilityText}
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};

export default ContactQuickModal;
