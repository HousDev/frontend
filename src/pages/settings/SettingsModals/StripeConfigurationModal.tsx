// SettingsModals/StripeConfigurationModal.tsx
import React, { useEffect, useState } from "react";
import { X, Key, Eye, EyeOff, Shield, Link as LinkIcon } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        publishableKey: string;
        secretKey?: string | null;
        webhookSecret?: string | null;
        webhookUrl?: string | null;
    }) => Promise<any> | void;
    integration?: {
        id?: string;
        api_key?: string | null;
        config?: {
            publishable_key?: string | null;
            secret_key?: string | null;
            webhook_secret?: string | null;
            webhook_url?: string | null;
        } | null;
        is_enabled?: boolean;
    } | null;
}

const StripeConfigurationModal: React.FC<Props> = ({ isOpen, onClose, onSave, integration }) => {
    const [publishableKey, setPublishableKey] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [webhookSecret, setWebhookSecret] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [saving, setSaving] = useState(false);

    const [showSecretKey, setShowSecretKey] = useState(false);
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);

    const [errors, setErrors] = useState<{
        publishableKey?: string;
        secretKey?: string;
        webhookSecret?: string;
        webhookUrl?: string;
        general?: string;
    }>({});

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (integration && isOpen) {
            const cfg = integration?.config ?? {};
            setPublishableKey(cfg?.publishable_key ?? integration?.api_key ?? "");
            setSecretKey(cfg?.secret_key ?? "");
            setWebhookSecret(cfg?.webhook_secret ?? "");
            setWebhookUrl(cfg?.webhook_url ?? "");
            setErrors({});
            setSaved(false);
        } else if (isOpen) {
            setPublishableKey("");
            setSecretKey("");
            setWebhookSecret("");
            setWebhookUrl("")
            setErrors({});
            setSaved(false);
        }
    }, [integration, isOpen]);

    if (!isOpen) return null;

    const validateUrl = (u: string) => {
        if (!u || !u.trim()) return false;
        try {
            const parsed = new URL(u.trim());
            return parsed.protocol === "https:" || parsed.protocol === "http:";
        } catch {
            return false;
        }
    };

    const validate = () => {
        const e: typeof errors = {};

        if (!publishableKey || !publishableKey.trim()) {
            e.publishableKey = "Stripe publishable key is required.";
        } else {
            const v = publishableKey.trim();
            if (!/^pk_(test|live)?_/.test(v) && !/^rk_/.test(v)) {
                e.publishableKey = "Publishable key usually starts with 'pk_test_' or 'pk_live_'.";
            }
        }

        if (!secretKey || !secretKey.trim()) {
            e.secretKey = "Secret key is required. Store securely on server.";
        } else {
            const s = secretKey.trim();
            if (!/^sk_(test|live)?_/.test(s) && !/^rk_/.test(s) && !/^s_/.test(s)) {
                e.secretKey = "Secret key usually starts with 'sk_test_' or 'sk_live_'. Please confirm.";
            }
        }

        if (!webhookSecret || !webhookSecret.trim()) {
            e.webhookSecret = "Webhook signing secret (whsec_...) is recommended for Stripe.";
        }

        if (!webhookUrl || !webhookUrl.trim()) {
            e.webhookUrl = "Webhook URL is required.";
        } else if (!validateUrl(webhookUrl)) {
            e.webhookUrl = "Please enter a valid Webhook URL (http or https).";
        } else {
            try {
                const pr = new URL(webhookUrl.trim());
                if (pr.protocol !== "https:") {
                    e.webhookUrl = "HTTPS is recommended for webhooks in production.";
                }
            } catch { }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const buildPayload = () => ({
        publishable_key: publishableKey.trim(),
        secret_key: secretKey.trim() || null,
        webhook_secret: webhookSecret.trim() || null,
        webhook_url: webhookUrl.trim() || null,
    });

    const handleSave = async () => {
        if (!validate()) return;

        const payload = buildPayload();
       

        setSaving(true);
        setErrors({});

        try {
            const resp = await onSave({
                publishableKey: payload.publishable_key,
                secretKey: payload.secret_key,
                webhookSecret: payload.webhook_secret,
                webhookUrl: payload.webhook_url,
            });

          
            setSaved(true);
        } catch (err: any) {
            console.error("❌ Error from onSave (Stripe):", err);
            const resp = err?.response?.data;
            if (resp && (resp.errors || resp.message)) {
                const newErrors: typeof errors = {};
                if (resp.errors && typeof resp.errors === "object") {
                    if (resp.errors.publishable_key)
                        newErrors.publishableKey = Array.isArray(resp.errors.publishable_key)
                            ? resp.errors.publishable_key.join(" ")
                            : String(resp.errors.publishable_key);
                    if (resp.errors.secret_key)
                        newErrors.secretKey = Array.isArray(resp.errors.secret_key)
                            ? resp.errors.secret_key.join(" ")
                            : String(resp.errors.secret_key);
                    if (resp.errors.webhook_secret)
                        newErrors.webhookSecret = Array.isArray(resp.errors.webhook_secret)
                            ? resp.errors.webhook_secret.join(" ")
                            : String(resp.errors.webhook_secret);
                    if (resp.errors.webhook_url)
                        newErrors.webhookUrl = Array.isArray(resp.errors.webhook_url)
                            ? resp.errors.webhook_url.join(" ")
                            : String(resp.errors.webhook_url);
                }
                if (!Object.keys(newErrors).length && resp.message) {
                    newErrors.general = String(resp.message);
                }
                setErrors(newErrors);
                return;
            }
            setErrors({ general: err?.message ?? "Something went wrong" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Stripe Configuration"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6" />
                        <div>
                            <h2 className="text-lg font-semibold leading-tight">Stripe Configuration</h2>
                            <p className="text-xs text-white/90">Configure publishable & secret keys, webhooks for Stripe</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 rounded-md hover:bg-white/10 transition" aria-label="Close modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Publishable Key (pk_...) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    value={publishableKey}
                                    onChange={(e) => setPublishableKey(e.target.value)}
                                    placeholder="pk_test_xxxxx"
                                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${errors.publishableKey ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-sky-500 transition`}
                                    autoComplete="off"
                                />
                            </div>
                            {errors.publishableKey && <p className="text-xs text-red-600 mt-2">{errors.publishableKey}</p>}
                            <p className="text-xs text-gray-400 mt-2">Publishable key safe for client-side usage.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key (sk_...) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showSecretKey ? "text" : "password"}
                                    value={secretKey}
                                    onChange={(e) => setSecretKey(e.target.value)}
                                    placeholder="sk_test_..."
                                    className={`w-full px-3 py-2.5 rounded-lg border ${errors.secretKey ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-sky-500 transition pr-10`}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowSecretKey((s) => !s)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.secretKey && <p className="text-xs text-red-600 mt-2">{errors.secretKey}</p>}
                            <p className="text-xs text-gray-400 mt-2">Store secret key on backend only.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Signing Secret <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showWebhookSecret ? "text" : "password"}
                                    value={webhookSecret}
                                    onChange={(e) => setWebhookSecret(e.target.value)}
                                    placeholder="whsec_..."
                                    className={`w-full px-3 py-2.5 rounded-lg border ${errors.webhookSecret ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-sky-500 transition pr-10`}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowWebhookSecret((s) => !s)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.webhookSecret && <p className="text-xs text-red-600 mt-2">{errors.webhookSecret}</p>}
                            <p className="text-xs text-gray-400 mt-2">Used by server to verify Stripe webhook signatures (whsec_...)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                <input
                                    type="url"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://example.com/webhooks/stripe"
                                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${errors.webhookUrl ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-sky-500 transition`}
                                    autoComplete="off"
                                />
                            </div>
                            {errors.webhookUrl && <p className="text-xs text-red-600 mt-2">{errors.webhookUrl}</p>}
                            <p className="text-xs text-gray-400 mt-2">Server endpoint that receives Stripe events — use HTTPS in production.</p>
                        </div>
                    </div>

                    {errors.general && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-xs text-red-700">{errors.general}</p></div>}

                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-sky-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-sky-900">Configuration Notes</h4>
                                <p className="text-xs text-sky-700 mt-1">Publishable key goes to frontend, secret keys & webhook secrets must stay on server. Use Stripe CLI to test webhooks locally.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between gap-3 border-t">
                    <div className="flex items-center gap-4">
                        {saved && <span className="text-sm text-green-600">Saved</span>}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-60" type="button" disabled={saving}>Cancel</button>

                        <button onClick={handleSave} className="px-6 py-2.5 rounded-lg text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-lg transition disabled:opacity-60" type="button" disabled={saving}>
                            {saving ? "Saving..." : "Save Stripe"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StripeConfigurationModal;
