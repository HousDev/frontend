import React, { useState, ReactNode, ChangeEvent } from "react";
import {
    Coffee,
    Utensils,
    Users,
    MapPinned,
    Building,
    FileText,
    User,
    TrendingUp,
    Play,
    X,
} from "lucide-react";

/* ------------------ Modal ------------------ */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                {children}
            </div>
        </div>
    );
};

/* ------------------ InputField ------------------ */
interface InputFieldProps {
    label: string;
    type?: string;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}
const InputField: React.FC<InputFieldProps> = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
    </div>
);

/* ------------------ SelectField ------------------ */
interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
    placeholder?: string;
}
const SelectField: React.FC<SelectFieldProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder,
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    </div>
);

/* ------------------ BreakTypesModal ------------------ */
interface BreakCustomDetails {
    clientName: string;
    property: string;
    meetingNotes: string;
    customDuration: string;
    priority: string;
    meetingWith: string;
    meetingPurpose: string;
}

interface BreakTypesModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSelectBreak?: (breakType: string, details: BreakCustomDetails & { duration: string | number }) => void;
}

interface BreakCategory {
    id: string;
    label: string;
    icon: React.ElementType;
    duration: number;
    productivity: number;
}

const BreakTypesModal: React.FC<BreakTypesModalProps> = ({
    isOpen = true,
    onClose = () => { },
    onSelectBreak = () => { },
}) => {
    const [selectedBreakType, setSelectedBreakType] = useState<string>("");
    const [breakCustomDetails, setBreakCustomDetails] = useState<BreakCustomDetails>({
        clientName: "",
        property: "",
        meetingNotes: "",
        customDuration: "",
        priority: "medium",
        meetingWith: "",
        meetingPurpose: "",
    });

    const clients = ["John Doe", "Jane Smith", "Michael Johnson"];
    const properties = ["Sunrise Apartments", "Green Villa", "Ocean View Flats"];

    const breakCategories: BreakCategory[] = [
        { id: "lunch", label: "Lunch Break", icon: Utensils, duration: 60, productivity: 0 },
        { id: "personal", label: "Personal Break", icon: User, duration: 20, productivity: 0 },
        { id: "tea", label: "Tea Break", icon: Coffee, duration: 15, productivity: 0.1 },
        { id: "documentation", label: "Documentation", icon: FileText, duration: 20, productivity: 0.7 },
        { id: "market_research", label: "Market Research", icon: TrendingUp, duration: 30, productivity: 0.7 },
        { id: "meeting", label: "New Client Meeting", icon: Users, duration: 45, productivity: 0.8 },
        { id: "site_visit", label: "Buyer Site Visit", icon: MapPinned, duration: 120, productivity: 1.0 },
        { id: "property_visit", label: "Seller Property Visit", icon: Building, duration: 90, productivity: 0.9 },
    ];

    const resetDetails = () =>
        setBreakCustomDetails({
            clientName: "",
            property: "",
            meetingNotes: "",
            customDuration: "",
            priority: "medium",
            meetingWith: "",
            meetingPurpose: "",
        });

    const handleBreakTypeSelect = (breakType: string) => {
        setSelectedBreakType(breakType);
        resetDetails();
    };

    const handleBreakStart = () => {
        if (!selectedBreakType) return;

        const category = breakCategories.find(cat => cat.id === selectedBreakType);
        const breakDetails = {
            ...breakCustomDetails,
            duration: breakCustomDetails.customDuration || category?.duration || 0
        };

        onSelectBreak(selectedBreakType, breakDetails);
        resetDetails();
        setSelectedBreakType("");
        onClose();
    };

    const renderBreakDetails = () => {
        const category = breakCategories.find((cat) => cat.id === selectedBreakType);
        if (!category) return null;

        const needsClientInfo = ["site_visit", "property_visit", "documentation"].includes(selectedBreakType);
        const needsLocation = ["site_visit", "property_visit"].includes(selectedBreakType);
        const needsNotes = ["personal", "documentation", "market_research"].includes(selectedBreakType);

        return (
            <div className="space-y-4">
                {needsClientInfo && (
                    <SelectField
                        label="Client Name*"
                        value={breakCustomDetails.clientName}
                        onChange={(e) =>
                            setBreakCustomDetails((prev) => ({ ...prev, clientName: e.target.value }))
                        }
                        options={clients}
                        placeholder="Select client"
                    />
                )}

                {needsLocation && (
                    <SelectField
                        label="Property*"
                        value={breakCustomDetails.property}
                        onChange={(e) =>
                            setBreakCustomDetails((prev) => ({ ...prev, property: e.target.value }))
                        }
                        options={properties}
                        placeholder="Select property"
                    />
                )}

                {needsNotes && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={breakCustomDetails.meetingNotes}
                            onChange={(e) =>
                                setBreakCustomDetails((prev) => ({ ...prev, meetingNotes: e.target.value }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows={3}
                            placeholder="Add notes or details"
                        />
                    </div>
                )}

                {selectedBreakType === "meeting" && (
                    <>
                        <InputField
                            label="Meeting With*"
                            value={breakCustomDetails.meetingWith}
                            onChange={(e) =>
                                setBreakCustomDetails((prev) => ({ ...prev, meetingWith: e.target.value }))
                            }
                            placeholder="e.g., Team Meeting, Client Discussion"
                        />

                        <InputField
                            label="Meeting Purpose"
                            value={breakCustomDetails.meetingPurpose}
                            onChange={(e) =>
                                setBreakCustomDetails((prev) => ({ ...prev, meetingPurpose: e.target.value }))
                            }
                            placeholder="e.g., Strategy Discussion, Deal Review"
                        />
                    </>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Duration (minutes)"
                        type="number"
                        value={breakCustomDetails.customDuration}
                        onChange={(e) =>
                            setBreakCustomDetails((prev) => ({ ...prev, customDuration: e.target.value }))
                        }
                        placeholder={category.duration.toString()}
                    />

                    <SelectField
                        label="Priority"
                        value={breakCustomDetails.priority}
                        onChange={(e) =>
                            setBreakCustomDetails((prev) => ({ ...prev, priority: e.target.value }))
                        }
                        options={["low", "medium", "high", "urgent"]}
                        placeholder="Select priority"
                    />
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Start Smart Break</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Break Type Selection */}
                <div>
                    <h3 className="text-base font-medium text-gray-700 mb-4">Select Break Type</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {breakCategories.map((category) => {
                            const IconComponent = category.icon;
                            const isSelected = selectedBreakType === category.id;
                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleBreakTypeSelect(category.id)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                        ? "border-orange-400 bg-orange-50"
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <IconComponent className="w-5 h-5 text-gray-700" />
                                            <h4 className="font-medium text-gray-900">{category.label}</h4>
                                        </div>
                                        <div className="flex flex-col items-end text-sm">
                                            <span className="text-gray-500">~{category.duration}m</span>
                                            {category.productivity > 0 ? (
                                                <span className="text-green-600 font-medium">
                                                    +{Math.round(category.productivity * 100)}% productive
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">No productivity</span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Break Details */}
                {selectedBreakType && (
                    <div>
                        <h3 className="text-base font-medium text-gray-700 mb-3">
                            Activity Details - {breakCategories.find((cat) => cat.id === selectedBreakType)?.label}
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">{renderBreakDetails()}</div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleBreakStart}
                        disabled={!selectedBreakType}
                        className={`px-6 py-2 rounded-lg font-medium transition ${selectedBreakType
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {!selectedBreakType ? (
                            "Select Activity Type"
                        ) : (
                            <div className="flex items-center gap-2">
                                <Play className="w-4 h-4" /> Start Activity
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BreakTypesModal;
