import React, { useEffect, useState } from "react";
import { X, Key } from "lucide-react";
import { toast } from "react-toastify";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { provider: "OpenAI"; api_key: string; is_active?: boolean }) => void;
    integration?: {
        id: string;
        is_enabled?: boolean;
        api_key?: string | null;
        config?: { token?: string | null; api_key?: string | null };
    } | null;
};

const ChatGPTConfigurationModal: React.FC<Props> = ({ isOpen, onClose, onSave, integration }) => {
    const [apiKey, setApiKey] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // prefill from integration if present
        const from =
            integration?.api_key ||
            integration?.config?.api_key ||
            integration?.config?.token ||
            "";
        setApiKey(from ?? "");
    }, [integration]);

    if (!isOpen) return null;

    const handleSave = async () => {
        const trimmed = apiKey.trim();
        if (!trimmed) {
            toast.error("Please enter your ChatGPT (OpenAI) API key.");
            return;
        }
        // optional soft check (won't block non sk- keys if you use proxy):
        // if (!trimmed.startsWith("sk-")) toast.warn("This doesn't look like a standard OpenAI key (sk-...).");

        try {
            setSaving(true);
            onSave({
                provider: "OpenAI",
                api_key: trimmed,
                is_active: true,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 text-white bg-gradient-to-r from-blue-600 to-indigo-600">
                    <h3 className="text-lg sm:text-xl font-semibold">ChatGPT Setup</h3>
                    <button onClick={onClose} className="hover:text-gray-200">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ChatGPT API Key
                    </label>
                    <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-********************************"
                            className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                        Enter your OpenAI API key. We recommend storing secrets on the server and using a proxy.
                    </p>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow disabled:opacity-70"
                    >
                        {saving ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatGPTConfigurationModal;
