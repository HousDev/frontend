// RazorpayConfigurationModal.tsx
import React, { useEffect, useState } from "react";
import { X, Key, Eye, EyeOff, Shield, Link as LinkIcon } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    keyId: string;
    keySecret?: string | null;
    webhookSecret?: string | null;
    webhookUrl?: string | null;
  }) => Promise<any> | void;
  integration?: {
    id?: string;
    api_key?: string | null;
    config?: {
      key_id?: string | null;
      key_secret?: string | null;
      webhook_secret?: string | null;
      webhook_url?: string | null;
    } | null;
    is_enabled?: boolean;
  } | null;
}

const RazorpayConfigurationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  integration,
}) => {
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const [errors, setErrors] = useState<{
    keyId?: string;
    keySecret?: string;
    webhookSecret?: string;
    webhookUrl?: string;
    general?: string;
  }>({});

  // saved indicates whether we've successfully saved at least once
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (integration && isOpen) {
      const cfg = integration?.config ?? {};
      setKeyId(cfg?.key_id ?? integration?.api_key ?? "");
      setKeySecret(cfg?.key_secret ?? "");
      setWebhookSecret(cfg?.webhook_secret ?? "");
      setWebhookUrl(cfg?.webhook_url ?? "");
      setErrors({});
      setSaved(false);
    }
  }, [integration, isOpen]);

  if (!isOpen) return null;

  const validateUrl = (u: string) => {
    if (!u || !u.trim()) return false; // now required
    try {
      const parsed = new URL(u.trim());
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  };

  const validate = () => {
    const e: typeof errors = {};

    if (!keyId || !keyId.trim()) {
      e.keyId = "Razorpay Key ID is required.";
    } else {
      if (!/^rzp_/.test(keyId.trim())) {
        e.keyId = "Key ID usually starts with 'rzp_'. Please enter a valid Key ID.";
      }
    }

    if (!keySecret || !keySecret.trim()) {
      e.keySecret = "Key Secret is required. Store this securely on your server.";
    }

    if (!webhookSecret || !webhookSecret.trim()) {
      e.webhookSecret = "Webhook Secret is required for verifying webhook payloads.";
    }

    if (!webhookUrl || !webhookUrl.trim()) {
      e.webhookUrl = "Webhook URL is required.";
    } else if (!validateUrl(webhookUrl)) {
      e.webhookUrl = "Please enter a valid Webhook URL (http or https).";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    provider: "Razorpay",
    key_id: keyId.trim(),
    key_secret: keySecret.trim() || null,
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
        keyId: payload.key_id,
        keySecret: payload.key_secret,
        webhookSecret: payload.webhook_secret,
        webhookUrl: payload.webhook_url,
      });
      setSaved(true); // mark saved on success
    } catch (err: any) {
      console.error("❌ Error from onSave:", err);
      const resp = err?.response?.data;
      if (resp && (resp.errors || resp.message)) {
        const newErrors: typeof errors = {};
        if (resp.errors && typeof resp.errors === "object") {
          if (resp.errors.key_id)
            newErrors.keyId = Array.isArray(resp.errors.key_id)
              ? resp.errors.key_id.join(" ")
              : String(resp.errors.key_id);
          if (resp.errors.key_secret)
            newErrors.keySecret = Array.isArray(resp.errors.key_secret)
              ? resp.errors.key_secret.join(" ")
              : String(resp.errors.key_secret);
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

  const handleCancel = () => {
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Razorpay Configuration"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-semibold leading-tight">Razorpay Configuration</h2>
              <p className="text-xs text-white/90">Configure your Razorpay keys & webhooks</p>
            </div>
          </div>

          <button
            onClick={handleCancel}
            className="p-2 rounded-md hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Row: Key ID + Key Secret (single row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label htmlFor="razorpay-keyid" className="block text-sm font-medium text-gray-700 mb-2">
                Razorpay Key ID <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Key className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <input
                  id="razorpay-keyid"
                  type="text"
                  value={keyId}
                  onChange={(e) => setKeyId(e.target.value)}
                  placeholder="rzp_test_xxxxx"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${errors.keyId ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500 transition`}
                  autoComplete="off"
                />
              </div>

              {errors.keyId && <p className="text-xs text-red-600 mt-2">{errors.keyId}</p>}

              <p className="text-xs text-gray-400 mt-2">
                Provide Key ID to the frontend. Keep secrets on the server.
              </p>
            </div>

            <div>
              <label htmlFor="razorpay-keysecret" className="block text-sm font-medium text-gray-700 mb-2">
                Key Secret <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="razorpay-keysecret"
                  type={showKeySecret ? "text" : "password"}
                  value={keySecret}
                  onChange={(e) => setKeySecret(e.target.value)}
                  placeholder="(required — store on server)"
                  className={`w-full px-3 py-2.5 rounded-lg border ${errors.keySecret ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500 transition pr-10`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowKeySecret((s) => !s)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  aria-label={showKeySecret ? "Hide key secret" : "Show key secret"}
                >
                  {showKeySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {errors.keySecret && <p className="text-xs text-red-600 mt-2">{errors.keySecret}</p>}

              <p className="text-xs text-gray-400 mt-2">
                Keep your Key Secret safe on the backend.
              </p>
            </div>
          </div>

          {/* Row: Webhook Secret + Webhook URL (both mandatory) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="razorpay-webhooksecret" className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="razorpay-webhooksecret"
                  type={showWebhookSecret ? "text" : "password"}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Webhook secret for verifying payloads"
                  className={`w-full px-3 py-2.5 rounded-lg border ${errors.webhookSecret ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500 transition pr-10`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret((s) => !s)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  aria-label={showWebhookSecret ? "Hide webhook secret" : "Show webhook secret"}
                >
                  {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {errors.webhookSecret && <p className="text-xs text-red-600 mt-2">{errors.webhookSecret}</p>}

              <p className="text-xs text-gray-400 mt-2">Used to verify webhook payloads on your server.</p>
            </div>

            <div>
              <label htmlFor="razorpay-webhookurl" className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <input
                  id="razorpay-webhookurl"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://example.com/webhooks/razorpay"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${errors.webhookUrl ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500 transition`}
                  autoComplete="off"
                />
              </div>

              {errors.webhookUrl && <p className="text-xs text-red-600 mt-2">{errors.webhookUrl}</p>}

              <p className="text-xs text-gray-400 mt-2">
                The server endpoint where Razorpay will post webhook events. Use HTTPS in production.
              </p>
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-700">{errors.general}</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Configuration Notes</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Provide only Key ID to the frontend. Store Key Secret & Webhook Secret securely on the server and never expose them in client-side logs. Webhook URL is required to receive events — prefer HTTPS endpoints.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Active toggle shown at bottom-left */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between gap-3 border-t">
          <div className="flex items-center gap-4">
            
            {saved && <span className="text-sm text-green-600">Saved</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-60"
              type="button"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transition disabled:opacity-60"
              type="button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Razorpay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayConfigurationModal;
