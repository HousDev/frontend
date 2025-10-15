import React, { useEffect, useState } from "react";
import {
    X,
    Eye,
    EyeOff,
    Key,
    Hash,
    Phone,
    Link as LinkIcon,
    Shield,
    Globe,
    Webhook,
} from "lucide-react";
import { toast } from "react-toastify";


type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        provider: string;              // "Meta"
        phone_number_id: string;       // WhatsApp Phone Number ID
        waba_id: string;               // WhatsApp Business Account ID
        access_token: string;          // Permanent access token (never store in FE)
        webhook_url?: string | null;   // Optional: your server webhook endpoint
        is_active?: boolean;           // enable/disable
    }) => void;
    integration?: {
        id?: string;
        config?: any;
        is_enabled?: boolean;
    } | null;
};

type FormState = {
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
    webhookUrl: string;
    isActive: boolean;
};

const WhatsAppConfigurationModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSave,
    integration,
}) => {
    const [showToken, setShowToken] = useState(false);
    const [form, setForm] = useState<FormState>({
        phoneNumberId: "",
        wabaId: "",
        accessToken: "",
        webhookUrl: "",
        isActive: false,
    });

    // Seed from integration
    useEffect(() => {
        const cfg = integration?.config || {};
        setForm({
            phoneNumberId: cfg?.phone_number_id || "",
            wabaId: cfg?.waba_id || "",
            accessToken: cfg?.access_token || "",
            webhookUrl: cfg?.webhook_url || "",
            isActive: Boolean(integration?.is_enabled),
        });
    }, [integration]);

    const onChange = (field: keyof FormState, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value as any }));
    };

    const validate = () => {
        const missing: string[] = [];
        const errors: string[] = [];

        if (!form.phoneNumberId.trim()) missing.push("Phone Number ID");
        if (!form.wabaId.trim()) missing.push("WABA ID");
        if (!form.accessToken.trim()) missing.push("Access Token");

        if (form.webhookUrl.trim()) {
            // very light URL check
            const valid =
                /^(http|https):\/\/[^ "]+$/.test(form.webhookUrl.trim());
            if (!valid) errors.push("Webhook URL is invalid");
        }

        return { missing, errors };
    };

    const handleSave = () => {
        const { missing, errors } = validate();
        if (missing.length || errors.length) {
            const parts: string[] = [];
            if (missing.length) parts.push(`Missing: ${missing.join(", ")}`);
            if (errors.length) parts.push(`Errors: ${errors.join(", ")}`);
            toast.error(parts.join(" | "));
            return;
        }

        onSave({
            provider: "Meta",
            phone_number_id: form.phoneNumberId.trim(),
            waba_id: form.wabaId.trim(),
            access_token: form.accessToken.trim(),
            webhook_url: form.webhookUrl.trim() || null,
            is_active: form.isActive, // <-- boolean (fixed)
        });
    };

    const handleCancel = () => onClose();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                {/* Header (same style family as Email modal) */}
                <div className="flex items-center justify-between px-6 py-4 text-white bg-gradient-to-r from-emerald-600 to-teal-600">
                    <div className="flex items-center gap-3">
                        <Phone className="h-6 w-6" />
                        <h3 className="text-lg sm:text-xl font-semibold">
                            WhatsApp Business (Meta) Configuration
                        </h3>
                    </div>
                    <button onClick={handleCancel} className="hover:text-gray-200">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Row 1: Phone Number ID / WABA ID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Phone Number ID */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Phone Number ID<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={form.phoneNumberId}
                                    onChange={(e) => onChange("phoneNumberId", e.target.value)}
                                    placeholder="e.g. 123456789012345"
                                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        {/* WABA ID */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                WABA ID (WhatsApp Business Account ID)
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={form.wabaId}
                                    onChange={(e) => onChange("wabaId", e.target.value)}
                                    placeholder="e.g. 987654321098765"
                                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Access Token */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Access Token */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">
                                Access Token<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type={showToken ? "text" : "password"}
                                    value={form.accessToken}
                                    onChange={(e) => onChange("accessToken", e.target.value)}
                                    placeholder="Paste your permanent access token"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken((s) => !s)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showToken ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">
                                Security tip: Token ko kabhi frontend storage me mat rakho. Server par
                                environment variable (e.g. <code>WA_ACCESS_TOKEN</code>) me store karein.
                            </p>
                        </div>
                    </div>

                    {/* Row 3: Webhook URL + Enable */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Webhook URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Webhook URL (optional)
                            </label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="url"
                                    value={form.webhookUrl}
                                    onChange={(e) => onChange("webhookUrl", e.target.value)}
                                    placeholder="https://your-domain.com/webhooks/whatsapp"
                                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Enable */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Enable Integration
                            </label>
                            <div className="flex items-center gap-2 h-[44px]">
                                <input
                                    id="wa-active"
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => onChange("isActive", e.target.checked)}
                                />
                                <label htmlFor="wa-active" className="text-sm text-gray-700">
                                    Active
                                </label>
                            </div>
                        </div>

                        {/* Note */}
                        <div className="rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 md:col-span-2">
                            <div className="flex items-start gap-2">
                                <Hash className="h-4 w-4 text-emerald-600 mt-0.5" />
                                <p className="text-xs text-emerald-800">
                                    <b>Meta WhatsApp Cloud API</b> ke liye aapko{" "}
                                    <b>Phone Number ID</b>, <b>WABA ID</b> aur{" "}
                                    <b>Permanent Access Token</b> chahiye hota hai.
                                    Webhook URL aapke backend ka endpoint hoga, jahan Meta
                                    message events post karta hai (verification ke saath).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Helpful links (optional, UI match) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-gray-200 p-3 flex items-start gap-2">
                            <Globe className="h-4 w-4 text-gray-500 mt-0.5" />
                            <p className="text-xs text-gray-600">
                                <b>Phone Number ID</b> & <b>WABA ID</b> Meta Business settings me milte hain.
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-3 flex items-start gap-2">
                            <Webhook className="h-4 w-4 text-gray-500 mt-0.5" />
                            <p className="text-xs text-gray-600">
                                <b>Webhook</b> verify karne ke liye hub challenge/verify-token logic
                                aapke backend me implement hona chahiye.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end border-t">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow"
                    >
                        Save WhatsApp API
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppConfigurationModal;
