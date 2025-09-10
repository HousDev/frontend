import React, { useState, useEffect } from "react";
import { MessageSquare, Eye, EyeOff, X, Key, Hash } from "lucide-react";
import { toast } from "react-toastify";

const SMSConfigurationModal = ({ isOpen, onClose, onSave, integration }) => {
    const [showToken, setShowToken] = useState(false);
    const [formData, setFormData] = useState({
        provider: "",
        apiKey: "",
        token: "",
        smsNumber: "+13159152581",
        smsFrom: "",
    });

    const providers = [
        "Select Provider",
        "Twilio",
        "AWS SNS",
        "Vonage",
        "TextMagic",
        "MessageBird",
        "Plivo",
    ];

    // jab integration change ho tab formData set karo
    useEffect(() => {
        if (integration) {
            setFormData({
                provider: (integration?.config?.sms_provider || "").toUpperCase(), // ✅ normalize
                apiKey: integration?.api_key || "",
                token: integration?.config?.token || "",
                smsNumber: integration?.config?.from_number || "+13159152581",
                smsFrom: integration?.config?.sender_name || "",
            });
        }
    }, [integration]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        const requiredFields = ["provider", "apiKey", "token", "smsNumber", "smsFrom"];
        const missingFields = requiredFields.filter((field) => !formData[field]);

        if (missingFields.length > 0) {
            toast.error(`Please fill all required fields: ${missingFields.join(", ")}`);
            return;
        }
        onSave(formData);
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <MessageSquare className="h-6 w-6" />
                        <h2 className="text-xl font-semibold">SMS API Configuration</h2>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-white hover:text-gray-200 transition"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* API Provider */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                API Provider <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.provider}
                                onChange={(e) => handleInputChange("provider", e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            >
                                {providers.map((provider, index) => (
                                    <option
                                        key={index}
                                        value={index === 0 ? "" : provider.toUpperCase()} // ✅ normalize value
                                        disabled={index === 0}
                                    >
                                        {index === 0 ? "-- Select Provider --" : provider}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* API Key */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                ID / KEY <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    value={formData.apiKey}
                                    onChange={(e) => handleInputChange("apiKey", e.target.value)}
                                    placeholder="API KEY or SID"
                                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 transition"
                                />
                            </div>
                        </div>

                        {/* Token */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                TOKEN / SECRET <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                <input
                                    type={showToken ? "text" : "password"}
                                    value={formData.token}
                                    onChange={(e) => handleInputChange("token", e.target.value)}
                                    placeholder="API Secret or Token"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* SMS Number */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                SMS NUMBER <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.smsNumber}
                                onChange={(e) => handleInputChange("smsNumber", e.target.value)}
                                placeholder="+13159152581"
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 transition"
                            />
                        </div>

                        {/* SMS From */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                SMS FROM <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.smsFrom}
                                onChange={(e) => handleInputChange("smsFrom", e.target.value)}
                                placeholder="Sender name or number"
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 transition"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-900">Configuration Notes</h4>
                                <p className="text-xs text-blue-700 mt-1">
                                    Use the correct API credentials from your SMS provider. 
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transition"
                    >
                        Save SMS API
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SMSConfigurationModal;
