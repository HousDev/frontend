// src/pages/settings/SettingsModals/EmailConfiguration.tsx
import React, { useEffect, useState } from "react";
import { X, Eye, EyeOff, Key, LockKeyhole, AtSign, Server, Shield, Hash, Mail } from "lucide-react";
import { toast } from "react-toastify";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    integration?: any;
};

type FormState = {
    smtpProvider: string;     // Mailtrap, Gmail, SES, etc.
    driver: "SMTP" | "SENDMAIL" | "MAILGUN";
    providerName: string;     // UI label/title
    host: string;             // smtp.mailtrap.io
    port: string;             // 2525 | 25 | 587 | 465 (string for input)
    security: "NONE" | "STARTTLS" | "SSL_TLS";
    username: string;
    password: string;
    emailFromAddress: string; // from@example.com
    emailFromName: string;    // Resale Expert
};

const PROVIDERS = [
    "Select",
    "Mailtrap",
    "Gmail",
    "Amazon SES",
    "Zoho Mail",
    "Outlook / Office 365",
    "SendGrid (SMTP)",
    "Mailgun (SMTP)",
    "Postmark (SMTP)",
    "SparkPost (SMTP)",
    "Custom",
];

const DRIVER_OPTIONS: Array<FormState["driver"]> = ["SMTP", "SENDMAIL", "MAILGUN"];

// Provider presets (SMTP)
const PRESETS: Record<
    string,
    { host: string; port: string; security: FormState["security"]; usernameHint?: string }
> = {
    "MAILTRAP": { host: "smtp.mailtrap.io", port: "2525", security: "NONE", usernameHint: "Mailtrap Username" },
    "GMAIL": { host: "smtp.gmail.com", port: "587", security: "STARTTLS", usernameHint: "your@gmail.com (App Password)" },
    "AMAZON SES": { host: "email-smtp.<region>.amazonaws.com", port: "587", security: "STARTTLS", usernameHint: "SES SMTP Username" },
    "ZOHO MAIL": { host: "smtp.zoho.com", port: "587", security: "STARTTLS", usernameHint: "you@yourdomain.com" },
    "OUTLOOK / OFFICE 365": { host: "smtp.office365.com", port: "587", security: "STARTTLS", usernameHint: "you@yourdomain.com" },
    "SENDGRID (SMTP)": { host: "smtp.sendgrid.net", port: "587", security: "STARTTLS", usernameHint: "apikey (literal)" },
    "MAILGUN (SMTP)": { host: "smtp.mailgun.org", port: "587", security: "STARTTLS", usernameHint: "postmaster@yourdomain" },
    "POSTMARK (SMTP)": { host: "smtp.postmarkapp.com", port: "587", security: "STARTTLS", usernameHint: "Server Token" },
    "SPARKPOST (SMTP)": { host: "smtp.sparkpostmail.com", port: "587", security: "STARTTLS", usernameHint: "SMTP Username" },
    "CUSTOM": { host: "", port: "", security: "STARTTLS" },
};

// Driver presets
const DRIVER_PRESET: Record<FormState["driver"], Partial<FormState>> = {
    SMTP: {},
    SENDMAIL: { host: "", port: "", security: "NONE", username: "", password: "" },
    MAILGUN: { host: "smtp.mailgun.org", port: "587", security: "STARTTLS" },
};

const EmailConfigurationModal: React.FC<Props> = ({ isOpen, onClose, onSave, integration }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState<FormState>({
        smtpProvider: "",
        driver: "SMTP",
        providerName: "",
        host: "",
        port: "2525",
        security: "NONE",
        username: "",
        password: "",
        emailFromAddress: "",
        emailFromName: "",
    });

    const isSmtpLike = form.driver !== "SENDMAIL"; // SMTP or MAILGUN → show SMTP fields

    // Seed from integration
    useEffect(() => {
        if (!integration) return;
        const cfg = integration?.config || {};
        const driverFromCfg = (cfg?.driver || "SMTP").toUpperCase();
        const driver: FormState["driver"] =
            driverFromCfg === "SENDMAIL" ? "SENDMAIL" : driverFromCfg === "MAILGUN" ? "MAILGUN" : "SMTP";

        setForm({
            smtpProvider: (cfg?.smtp_provider || "").toUpperCase(),
            driver,
            providerName: cfg?.provider_name || "",
            host: cfg?.host || (driver === "MAILGUN" ? "smtp.mailgun.org" : ""),
            port: String(cfg?.port || (driver === "MAILGUN" ? "587" : "")),
            security: ((cfg?.security || (driver === "MAILGUN" ? "STARTTLS" : "NONE")) as FormState["security"]),
            username: cfg?.username || integration?.api_key || "",
            password: cfg?.password || integration?.api_secret || "",
            emailFromAddress: cfg?.from_address || "",
            emailFromName: cfg?.from_name || "",
        });
    }, [integration]);

    // Apply SMTP provider preset if helpful
    const applyProviderPreset = (provUpper: string) => {
        if (!isSmtpLike) return; // sendmail: ignore provider preset
        const preset = PRESETS[provUpper];
        if (!preset) return;
        setForm(prev => ({
            ...prev,
            host: prev.host || preset.host,
            port: prev.port || preset.port,
            security: prev.security || preset.security,
        }));
    };

    // When driver changes, apply driver preset & handle fields visibility
    const onDriverChange = (drv: FormState["driver"]) => {
        const preset = DRIVER_PRESET[drv];
        setForm(prev => ({
            ...prev,
            driver: drv,
            host: preset.host !== undefined ? preset.host : prev.host,
            port: preset.port !== undefined ? String(preset.port) : prev.port,
            security: (preset.security as FormState["security"]) ?? prev.security,
            // clear creds for sendmail
            username: drv === "SENDMAIL" ? "" : prev.username,
            password: drv === "SENDMAIL" ? "" : prev.password,
        }));
    };

    const onChange = (field: keyof FormState, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validate = (): { missing: (keyof FormState)[]; mistakes: string[] } => {
        const baseRequired: (keyof FormState)[] = ["driver", "providerName", "emailFromAddress"];
        const smtpRequired: (keyof FormState)[] = ["smtpProvider", "host", "port", "security", "username", "password"];
        const required: (keyof FormState)[] = isSmtpLike ? [...baseRequired, ...smtpRequired] : baseRequired;

        const missing = required.filter(k => !String((form as any)[k] ?? "").trim());
        const mistakes: string[] = [];

        if (form.emailFromAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailFromAddress)) {
            mistakes.push("Email From Address is invalid");
        }
        if (isSmtpLike && form.port && !/^\d+$/.test(form.port)) {
            mistakes.push("Port must be numeric");
        }

        return { missing, mistakes };
    };

    const handleSave = () => {
        const { missing, mistakes } = validate();
        if (missing.length || mistakes.length) {
            const parts: string[] = [];
            if (missing.length) parts.push(`Missing: ${missing.join(", ")}`);
            if (mistakes.length) parts.push(`Errors: ${mistakes.join(", ")}`);
            toast.error(parts.join(" | "));
            return;
        }

        // payload shape (consistent with your other integrations)
        const payload = {
            driver: form.driver,                 // "SMTP" | "SENDMAIL" | "MAILGUN"
            api_key: form.username,              // optional parity
            api_secret: form.password,
            config: {
                smtp_provider: form.smtpProvider,
                driver: form.driver,
                provider_name: form.providerName,
                host: isSmtpLike ? form.host : "",
                port: isSmtpLike ? Number(form.port) : undefined,
                security: isSmtpLike ? form.security : "NONE",
                username: isSmtpLike ? form.username : "",
                password: isSmtpLike ? form.password : "",
                from_address: form.emailFromAddress,
                from_name: form.emailFromName,
            },
        };

        onSave(payload);
    };

    const handleCancel = () => onClose();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 text-white bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <Mail className="h-6 w-6" />
                        <h3 className="text-lg sm:text-xl font-semibold">Email API Configuration</h3>
                    </div>
                    <button onClick={handleCancel} className="hover:text-gray-200">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Row 1: Provider / Driver / Provider Name */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* SMTP Provider */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                SMTP Provider<span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.smtpProvider}
                                onChange={(e) => {
                                    const val = (e.target.value || "").toUpperCase();
                                    onChange("smtpProvider", val);
                                    applyProviderPreset(val);
                                }}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={!isSmtpLike}
                            >
                                {PROVIDERS.map((p, i) => (
                                    <option key={p} value={i === 0 ? "" : p.toUpperCase()} disabled={i === 0}>
                                        {i === 0 ? "Select" : p}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Driver */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Driver<span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.driver}
                                onChange={(e) => onDriverChange(e.target.value as FormState["driver"])}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {DRIVER_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* Provider Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Provider Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.providerName}
                                onChange={(e) => onChange("providerName", e.target.value)}
                                placeholder="Provider Title"
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Row 2: Host / Port / Security (SMTP-like only) */}
                    {isSmtpLike && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Host */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Host<span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Server className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={form.host}
                                        onChange={(e) => onChange("host", e.target.value)}
                                        placeholder={form.driver === "MAILGUN" ? "smtp.mailgun.org" : "smtp.mailtrap.io"}
                                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Port */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Port<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.port}
                                    onChange={(e) => onChange("port", e.target.value.replace(/[^\d]/g, ""))}
                                    placeholder={form.driver === "MAILGUN" ? "587" : "2525"}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-[11px] text-gray-500">2525, 25, 587, 465</p>
                            </div>

                            {/* Security */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Security</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <select
                                        value={form.security}
                                        onChange={(e) => onChange("security", e.target.value as FormState["security"])}
                                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="NONE">No Encryption</option>
                                        <option value="STARTTLS">STARTTLS</option>
                                        <option value="SSL_TLS">SSL/TLS</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Row 3: Username / Password (SMTP-like only) */}
                    {isSmtpLike && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Username */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Username<span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={form.username}
                                        onChange={(e) => onChange("username", e.target.value)}
                                        placeholder={form.driver === "MAILGUN" ? "postmaster@yourdomain" : "username / SMTP user"}
                                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Password<span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) => onChange("password", e.target.value)}
                                        placeholder="password / app password"
                                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Row 4: From Address / From Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* From Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Email From Address<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={form.emailFromAddress}
                                    onChange={(e) => onChange("emailFromAddress", e.target.value)}
                                    placeholder="example@gmail.com"
                                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* From Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Email From Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.emailFromName}
                                onChange={(e) => onChange("emailFromName", e.target.value)}
                                placeholder="Resale Expert"
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Note */}
                        <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:col-span-2">
                            <div className="flex items-start gap-2">
                                <Hash className="h-4 w-4 text-blue-600 mt-0.5" />
                                <p className="text-xs text-blue-800">
                                    Driver <b>SENDMAIL</b> server ke local MTA (postfix/exim) ko use karta hai—SMTP fields ki zarurat nahi.
                                    <br />
                                    <b>MAILGUN</b> choose karoge to SMTP presets auto fill ho jayenge.
                                </p>
                            </div>
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
                        className="px-6 py-2.5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow"
                    >
                        Save Email API
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailConfigurationModal;
