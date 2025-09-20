// SellerFormModal.tsx
import React, { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import { usersAPI } from "@/lib/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignableExecutives } from "@/pages/utils/roleBasedOptions";
import { ChevronDown } from "lucide-react";
import PriceRangeSelector from "@/components/ui/PriceRangeSelector";
import { sellerTransferAPI } from "@/lib/sellerTransferAPI";

type Lead = {
    id?: string;
    salutation?: string;
    name?: string;
    phone?: string;
    whatsapp_number?: string;
    email?: string;
    city?: string;
    state?: string;
    location?: string;
    lead_source?: string;
    lead_type?: string;
    priority?: string;
    status?: string;
    stage?: string;
    created_at?: string;
    created_by?: string;
    last_contact?: string;
    last_contacted_by?: string;
    budget_range_readable?: string | null;
    budget_range?: string | null;
    budget_min?: number | string | null;
    budget_max?: number | string | null;
    unit_type?: string;
    property_subtype?: string;
    property_type?: string;
    assigned_executive?: string | number;
    notes?: string;
    nearbyplaces?: string;
    updated_at?: string;
    is_active?: boolean;
    carpetArea?: string | number;
    society?: string;
    // add any other fields you expect
};

type Followup = {
    id?: string;
    type?: string;
    remark?: string;
    customRemark?: string;
    scheduledDate?: string | null;
    createdAt?: string | null;
    priority?: string;
    stage?: string;
    status?: string;
    createdByFirstName?: string;
    createdByLastName?: string;
};

export interface SellerFormModalProps {
    lead: Lead;
    followups?: Followup[];
    onClose: () => void;
}

type UserSimple = {
    id?: string | number;
    _id?: string | number;
    name?: string;
    full_name?: string;
    username?: string;
    department?: string;
    role?: string;
};

const toNumberSafe = (s?: string | number | null): number | null => {
    if (s == null || s === "") return null;
    if (typeof s === "number") return s;
    const cleaned = String(s).replace(/,/g, "").trim();
    const m = cleaned.match(/-?[\d.]+/);
    if (!m) return null;
    const n = parseFloat(m[0]);
    return Number.isNaN(n) ? null : n;
};

/**
 * Convert different readable forms into a canonical "L" or "Cr" string for form display.
 * - Accepts inputs like "28L", "2.50Cr", numeric meaning either L-value (>=100) or Crore (>=1)
 */
const toLOrCrString = (params: { readable?: string | null; min?: string | number | null; max?: string | number | null }): string => {
    const { readable, min, max } = params;

    const normalize = (s?: string | null) => (s ? String(s).replace(/,/g, "").trim() : "");

    // If explicit readable provided: parse suffixes
    if (readable) {
        const r = normalize(readable).toLowerCase();
        // Lakh suffix (l, lakh, lakhs)
        const lakhMatch = r.match(/^([\d.]+)\s*(l|lakh|lakhs)$/i);
        if (lakhMatch) {
            const n = toNumberSafe(lakhMatch[1]);
            if (n != null) return `${Math.round(n)}L`;
        }
        // Crore suffix (cr, crore, crores)
        const croreMatch = r.match(/^([\d.]+)\s*(cr|crore|crores)$/i);
        if (croreMatch) {
            const n = toNumberSafe(croreMatch[1]);
            if (n != null) return `${Number(n.toFixed(2))}Cr`;
        }

        // Range like "20 - 50" or "0.20 to 0.50"
        const rangeMatch = r.match(/([\d.]+)\s*(?:-|to)\s*([\d.]+)/i);
        if (rangeMatch) {
            const a = toNumberSafe(rangeMatch[1]);
            const b = toNumberSafe(rangeMatch[2]);
            const chosen = b != null ? b : a;
            if (chosen != null) {
                if (chosen >= 100) {
                    const cr = chosen / 100;
                    return cr >= 1 ? `${Number(cr.toFixed(2))}Cr` : `${Math.round(cr * 100)}L`;
                }
                if (chosen < 1) {
                    return `${Math.round(chosen * 100)}L`;
                }
                return `${Number(chosen.toFixed(2))}Cr`;
            }
        }

        // single numeric-like
        const single = toNumberSafe(r);
        if (single != null) {
            if (single >= 100) {
                const cr = single / 100;
                return cr >= 1 ? `${Number(cr.toFixed(2))}Cr` : `${Math.round(cr * 100)}L`;
            }
            if (single < 1) {
                return `${Math.round(single * 100)}L`;
            }
            return `${Number(single.toFixed(2))}Cr`;
        }
    }

    // fallback to numeric max then min
    const nMax = toNumberSafe(max as any);
    const nMin = toNumberSafe(min as any);
    const chosenNum = nMax != null ? nMax : nMin;

    if (chosenNum != null) {
        if (chosenNum >= 100) {
            const cr = chosenNum / 100;
            return cr >= 1 ? `${Number(cr.toFixed(2))}Cr` : `${Math.round(cr * 100)}L`;
        }
        if (chosenNum < 1) {
            return `${Math.round(chosenNum * 100)}L`;
        }
        return `${Number(chosenNum.toFixed(2))}Cr`;
    }

    return "";
};

const SellerFormModal: React.FC<SellerFormModalProps> = ({ lead, onClose }) => {
    const { user } = useAuth();

    const [showUnitTypeDropdown, setShowUnitTypeDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [showExecDropdown, setShowExecDropdown] = useState(false);

    const unitTypeButtonRef = useRef<HTMLDivElement | null>(null);
    const locationButtonRef = useRef<HTMLDivElement | null>(null);
    const execDropdownRef = useRef<HTMLDivElement | null>(null);

    const [masterLoading, setMasterLoading] = useState(true);
    const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});

    const [allUsers, setAllUsers] = useState<UserSimple[]>([]);
    const [presalesUsers, setPresalesUsers] = useState<UserSimple[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const resp = await usersAPI.getAllUsers?.();
                const users = resp?.data ?? [];
                setAllUsers(users);

                const execs = users.filter(
                    (u: any) =>
                        (String(u?.department || "").toLowerCase() === "presales" || String(u?.department || "").toLowerCase() === "pre-sales") &&
                        String(u?.role || "").toLowerCase() === "executive"
                );
                setPresalesUsers(execs);
            } catch (err) {
                console.error("Failed to load users:", err);
            }
        })();
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // minimal typed formData
    const [formData, setFormData] = useState<Record<string, any>>({
        salutation: "",
        name: "",
        phone: "",
        whatsapp_number: "",
        email: "",
        lead_source: "",
        lead_type: "",
        priority: "",
        status: "",
        created_at: "",
        created_by: "",
        last_contact: "",
        last_contacted_by: "",
        budget_range: "",
        unit_type: "",
        city: "",
        location: "",
        property_subtype: "",
        property_type: "",
        assigned_executive: "",
        notes: "",
        nearbyplaces: "",
        carpetArea: "",
        society: "",
        updated_at: "",
        is_active: true,
    });

    // helper to get user display
    const getUserNameById = (id?: string | number | null) => {
        if (!id) return "";
        const u = allUsers.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
        return (u as any)?.name || (u as any)?.full_name || (u as any)?.username || "";
    };

    // Initialize form from lead
    useEffect(() => {
        if (!lead) return;

        const leadReadable = lead?.budget_range_readable ?? (lead?.budget_range ? String(lead.budget_range).trim() : null) ?? null;

        const initialBudget = leadReadable
            ? toLOrCrString({ readable: leadReadable, min: lead?.budget_min, max: lead?.budget_max })
            : toLOrCrString({ min: lead?.budget_min, max: lead?.budget_max });

        setFormData((prev) => ({
            ...prev,
            salutation: lead.salutation ?? "",
            name: lead.name ?? "",
            phone: lead.phone ?? "",
            whatsapp_number: lead.whatsapp_number ?? "",
            email: lead.email ?? "",
            lead_source: lead.lead_source ?? "",
            lead_type: lead.lead_type ?? "",
            priority: lead.priority ?? "",
            status: lead.status ?? "",
            stage: lead.stage ?? "",
            created_at: lead.created_at ?? new Date().toISOString(),
            created_by: lead.created_by ?? "",
            last_contact: lead.last_contact ?? "",
            last_contacted_by: lead.last_contacted_by ?? "",
            budget_range: initialBudget || "",
            unit_type: lead.unit_type ?? "",
            location: lead.location ?? "",
            city: lead.city ?? "",
            property_subtype: lead.property_subtype ?? "",
            property_type: lead.property_type ?? "",
            assigned_executive: lead.assigned_executive ?? "",
            notes: lead.notes ?? "",
            nearbyplaces: lead.nearbyplaces ?? "",
            updated_at: lead.updated_at ?? "",
            is_active: lead.is_active != null ? !!lead.is_active : true,
            carpetArea: lead.carpetArea ?? "",
            society: lead.society ?? "",
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lead]);

    const getAssignedExecName = () => {
        if (formData?.assigned_executive) {
            const exec = presalesUsers.find(
                (u) => String(u.id) === String(formData.assigned_executive) || String(u._id) === String(formData.assigned_executive)
            );
            return exec?.name || getUserNameById(formData.assigned_executive) || "Unassigned";
        }
        return "Unassigned";
    };

    const handleExecAssign = async (execId: string | number) => {
        try {
            setFormData((prev) => ({
                ...prev,
                assigned_executive: execId,
            }));
            setShowExecDropdown(false);
            const name = getUserNameById(execId) || presalesUsers.find((u) => String(u.id) === String(execId))?.name || "Executive";
            toast.success(`Seller assigned to ${name}`);
        } catch (err) {
            console.error("Error assigning executive:", err);
            toast.error("Failed to assign. Please try again.");
        }
    };

    const getOptionNames = (possibleKeys: string[]) => {
        for (const k of possibleKeys) {
            const arr = (masters as any)[k];
            if (Array.isArray(arr) && arr.length) {
                return arr.map((it: any) => (typeof it === "string" ? it : it.name ?? it.label ?? it.title ?? it.id));
            }
        }
        return [];
    };

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                setMasterLoading(true);
                const data = await getMasterDropdownOptions(["common", "property"]);
                setMasters(data as any);
            } catch (err) {
                console.error("Error fetching master options:", err);
                toast.error("Failed to load dropdown options");
            } finally {
                setMasterLoading(false);
            }
        };

        fetchMasters();
    }, []);

    const locationOptions = getOptionNames(["location", "locations", "locations_list"]);
    const unitTypeOptions = getOptionNames(["unit type", "unit_type", "unitType", "unit_types", "unitTypes"]);
    const propertySubtypeOptions = getOptionNames(["property subtype", "property_subtype", "propertySubtype", "property_subtypes"]);
    const propertyTypeOptions = getOptionNames(["property type", "property_type", "propertyType", "property_types"]);
    const cityOptions = getOptionNames(["city", "cities", "master_city"]);
    const societyOptions = getOptionNames(["society", "societies", "society_name", "master_society"]);

    // Styles (kept as strings you used)
    const wrapperClass = "border-2 border-green-400 rounded-lg p-3 mt-2 space-y-3 bg-white";
    const sharedControlClass = "w-full h-10 px-3 text-xs rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-600";
    const sharedReadOnlyClass = "w-full h-10 px-3 text-xs rounded-md border border-gray-200 bg-gray-100 text-gray-700 cursor-not-allowed";
    const sharedTextareaClass = "w-full px-3 py-2 text-xs rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-300 resize-none";
    const execButtonClass = "w-full flex items-center justify-between space-x-2 border border-gray-300 rounded-md h-10 px-2 text-xs bg-white hover:bg-gray-50";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, value: string) => {
        setFormData((prev) => {
            const currentArray: string[] = prev[name] ?? [];
            const updatedArray = currentArray.includes(value) ? currentArray.filter((item) => item !== value) : [...currentArray, value];
            return { ...prev, [name]: updatedArray };
        });
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({ ...prev, notes: value }));
    };

    const handleNearbyLocationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({ ...prev, nearbyplaces: value }));
    };

    const handleUnitTypeToggle = () => {
        setShowLocationDropdown(false);
        setShowExecDropdown(false);
        setShowUnitTypeDropdown((s) => !s);
    };

    const handleLocationToggle = () => {
        setShowUnitTypeDropdown(false);
        setShowExecDropdown(false);
        setShowLocationDropdown((s) => !s);
    };

    useEffect(() => {
        const onDocClick = (ev: MouseEvent) => {
            const target = ev.target as Node;
            if (unitTypeButtonRef.current && !unitTypeButtonRef.current.contains(target) && showUnitTypeDropdown) {
                setShowUnitTypeDropdown(false);
            }
            if (locationButtonRef.current && !locationButtonRef.current.contains(target) && showLocationDropdown) {
                setShowLocationDropdown(false);
            }
            if (execDropdownRef.current && !execDropdownRef.current.contains(target) && showExecDropdown) {
                setShowExecDropdown(false);
            }
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, [showUnitTypeDropdown, showLocationDropdown, showExecDropdown]);

    // Build overrides
    const buildOverrides = () => {
        const overrides: Record<string, any> = {
            property_type: formData.property_type || null,
            property_subtype: formData.property_subtype || null,
            unit_type: Array.isArray(formData.unit_type) ? formData.unit_type : formData.unit_type ? [formData.unit_type] : [],
            location: Array.isArray(formData.location) ? formData.location : formData.location ? [formData.location] : [],
            nearbyplaces: formData.nearbyplaces || null,
            budget_range: formData.budget_range || null,
            deal_value: formData.budget_range || null,
            notes: formData.notes || null,
            assigned_executive: formData.assigned_executive || null,
            is_active: formData.is_active !== undefined ? !!formData.is_active : true,
            updated_at: new Date().toISOString(),
        };

        Object.keys(overrides).forEach((k) => {
            const v = overrides[k];
            if (v === undefined || v === null) {
                delete overrides[k];
            } else if (typeof v === "string" && v.trim() === "") {
                delete overrides[k];
            } else if (Array.isArray(v) && v.length === 0) {
                delete overrides[k];
            }
        });

        return overrides;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const overrides = buildOverrides();

            const payload: any = {
                leadId: lead?.id,
                overrides,
                createdBy: user?.id,
            };

            console.log("Payload being sent to API:", payload);

            // Sender API - assume transferToSeller exists and returns Promise
            await sellerTransferAPI.transferToSeller(payload);

            toast.success("Seller information transferred successfully!");
            onClose();
        } catch (err: any) {
            console.error("Transfer to seller failed:", err);
            const msg = err?.response?.data?.error || err?.message || "Transfer failed. Try again.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // derive initialMax for selector (in Crores)
    const initialMaxFromForm = (() => {
        const v = formData?.budget_range;
        if (!v) return 0.01; // default 0.01 Cr (1L) so PriceRangeSelector has sensible start
        const s = String(v).trim().toLowerCase();

        // Examples: "28L", "1.25Cr", "0.50" (as crores), "250" (as lakhs if that was used)
        if (s.endsWith("l")) {
            const n = parseFloat(s.replace(/[l\s]/g, "")) || 0;
            // n is in Lakhs: convert to Crores -> n (L) / 100
            return Number((n / 100).toFixed(3));
        }
        if (s.endsWith("cr")) {
            return parseFloat(s.replace(/cr/i, "").trim()) || 0;
        }

        // If it's plain number and > 1 probably Crores else handle heuristics
        const parsed = parseFloat(s);
        if (!isNaN(parsed) && parsed > 0) {
            // if parsed > 10 assume it's in Lakhs (e.g., 250 => 250L = 2.5Cr)
            if (parsed >= 100) {
                return Number((parsed / 100).toFixed(3));
            }
            // otherwise treat as crores
            return parsed;
        }

        return 0.01;
    })();

    return (
        <Modal isOpen={true} onClose={onClose} title="Seller Form" width="max-w-4xl">
            <div className="text-xs">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <div className="space-y-2 p-2">
                            {/* First row */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Salutation</label>
                                    <input type="text" name="salutation" value={formData.salutation} readOnly className={sharedReadOnlyClass} />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1"> Full Name </label>
                                    <input type="text" name="name" value={formData.name} readOnly className={sharedReadOnlyClass} />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number </label>
                                    <input type="text" name="phone" value={formData.phone} readOnly className={sharedReadOnlyClass} />
                                </div>

                                <div className="md:col-span-4">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Number</label>
                                    <input type="text" name="whatsapp_number" value={formData.whatsapp_number} readOnly className={sharedReadOnlyClass} />
                                </div>
                            </div>

                            {/* Second row */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end mt-2">
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" name="email" value={formData.email} readOnly className={sharedReadOnlyClass} />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
                                    <input type="text" name="lead_source" value={formData.lead_source} readOnly className={sharedReadOnlyClass} />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Lead Type</label>
                                    <input type="text" name="lead_type" value={formData.lead_type} readOnly className={sharedReadOnlyClass} />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                    <input type="text" name="status" value={formData.status} readOnly className={sharedReadOnlyClass} />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium">Created By</label>
                                    <input
                                        type="text"
                                        name="created_by"
                                        value={(lead as any)?.created_by_name || getUserNameById(formData.created_by) || formData.created_by || ""}
                                        readOnly
                                        className={sharedReadOnlyClass}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={`${wrapperClass}`}>
                            {/* Property Type, Subtype, Assigned Executive */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mt-3">
                                <div>
                                    <label className="block text-xs font-medium">Property Type</label>
                                    <div className="relative">
                                        <select name="property_type" value={formData.property_type} onChange={handleChange} className={`${sharedControlClass} appearance-none pr-8`}>
                                            <option value="">Select Property Type</option>
                                            {propertyTypeOptions.length > 0 ? (
                                                propertyTypeOptions.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="Commercial">Commercial</option>
                                                    <option value="Residential">Residential</option>
                                                </>
                                            )}
                                        </select>
                                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium">Property Subtype</label>
                                    <div className="relative">
                                        <select name="property_subtype" value={formData.property_subtype} onChange={handleChange} className={`${sharedControlClass} appearance-none pr-8`}>
                                            <option value="">Select Property Subtype</option>
                                            {propertySubtypeOptions.length > 0 ? (
                                                propertySubtypeOptions.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="Apartment">Apartment</option>
                                                    <option value="Row House">Row House</option>
                                                    <option value="Plot">Plot</option>
                                                </>
                                            )}
                                        </select>
                                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-green-700">Assigned Executive</label>
                                    <div className="relative" ref={execDropdownRef}>
                                        <button type="button" onClick={() => setShowExecDropdown(!showExecDropdown)} className={execButtonClass}>
                                            <span className="truncate text-xs">{getAssignedExecName()}</span>
                                            <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                        </button>

                                        {showExecDropdown && (
                                            <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border z-[9999] text-xs">
                                                <div className="p-2">
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-wide px-2 py-1 border-b truncate">Assign to Executive</div>

                                                    {(() => {
                                                        const execs = getAssignableExecutives(user, presalesUsers || []);

                                                        if (!execs || execs.length === 0) {
                                                            return (
                                                                <div className="px-2 py-2 text-xs text-gray-500">
                                                                    <div>No executives available</div>
                                                                </div>
                                                            );
                                                        }

                                                        return execs.map((exec: any) => (
                                                            <button
                                                                key={exec.id}
                                                                type="button"
                                                                onClick={() => handleExecAssign(exec.id)}
                                                                className={`w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-xs truncate ${String(formData.assigned_executive) === String(exec.id) ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-800"}`}
                                                            >
                                                                {exec.name}
                                                            </button>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Unit Type | Society | Carpet Area */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1">Unit Type</label>
                                    <div className="relative">
                                        <select
                                            name="unit_type"
                                            value={formData.unit_type || ""}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    unit_type: e.target.value,
                                                }))
                                            }
                                            className={`${sharedControlClass} appearance-none pr-8`}
                                        >
                                            <option value="">Select Unit Type</option>
                                            {(unitTypeOptions.length > 0 ? unitTypeOptions : ["1BHK", "2BHK", "3BHK", "Villa"]).map((unitType) => (
                                                <option key={unitType} value={unitType}>
                                                    {unitType}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1">Society Name</label>
                                    <div className="relative">
                                        <select name="society" value={formData.society || ""} onChange={handleChange} className={`${sharedControlClass} appearance-none pr-8`}>
                                            <option value="">Select Society Name</option>
                                            {societyOptions.length > 0 ? (
                                                societyOptions.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="">No societies available</option>
                                            )}
                                        </select>
                                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium">Carpet Area (sq.ft)</label>
                                    <input type="number" name="carpetArea" placeholder="Enter carpet area" value={formData.carpetArea || ""} onChange={handleChange} className={sharedControlClass} />
                                </div>
                            </div>

                            {/* CITY + LOCATION */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 items-start">
                                <div>
                                    <label className="block text-xs font-medium mb-1">City</label>
                                    <div className="relative">
                                        <select name="city" value={formData.city || ""} onChange={handleChange} className={`${sharedControlClass} appearance-none pr-8`}>
                                            <option value="">Select City</option>
                                            {cityOptions.length > 0 ? (
                                                cityOptions.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="">No cities available</option>
                                            )}
                                        </select>
                                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1">Location</label>
                                    <div className="relative">
                                        <select name="location" value={formData.location || ""} onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))} className={`${sharedControlClass} appearance-none pr-8`}>
                                            <option value="">Select Location</option>
                                            {(locationOptions.length > 0 ? locationOptions : ["Hinjewadi", "Baner", "Wakad", "Pune"]).map((loc) => (
                                                <option key={loc} value={loc}>
                                                    {loc}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Price range */}
                            <div className="mt-3">
                                <label className="block text-xs font-medium">Budget(₹, Crores)</label>
                                <div className="mt-2">
                                    <PriceRangeSelector
                                        initialMax={initialMaxFromForm}
                                        max={5}
                                        onChange={({ min, max: maxV, readable }) => {
                                            const r = String(readable).trim();
                                            let budgetString = r;

                                            // If readable doesn't include L/Cr suffix, build from numeric max (which is in Crores)
                                            if (!/[lc]r?$/i.test(r)) {
                                                const numeric = Number(maxV || 0);
                                                if (numeric < 1) {
                                                    budgetString = `${Math.round(numeric * 100)}L`;
                                                } else {
                                                    budgetString = `${Number(numeric.toFixed(2))}Cr`;
                                                }
                                            } else {
                                                // normalize explicit suffixes
                                                if (/l$/i.test(r)) {
                                                    const n = parseFloat(r.replace(/l/i, "").trim()) || 0;
                                                    budgetString = `${Math.round(n)}L`;
                                                } else if (/cr$/i.test(r)) {
                                                    const n = parseFloat(r.replace(/cr/i, "").trim()) || 0;
                                                    budgetString = `${Number(n.toFixed(2))}Cr`;
                                                }
                                            }

                                            setFormData((prev) => ({
                                                ...prev,
                                                budget_range: budgetString,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 mt-3 items-start">
                                <div className="flex flex-col h-full">
                                    <label htmlFor="nearbyplaces" className="block text-xs font-medium text-gray-700 mb-1">
                                        Nearby Places
                                    </label>
                                    <textarea id="nearbyplaces" name="nearbyplaces" value={formData.nearbyplaces} onChange={handleNearbyLocationsChange} rows={3} placeholder="e.g. Near City Mall, beside Community Park" className={sharedTextareaClass} />
                                </div>

                                <div className="flex flex-col h-full">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea name="notes" value={formData.notes} onChange={handleNotesChange} rows={3} placeholder="Add any buyer notes here..." className={sharedTextareaClass} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-1">
                        <button type="button" onClick={onClose} className="px-3 py-2 bg-gray-300 rounded text-xs">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-3 py-2 bg-blue-600 text-white rounded text-xs flex items-center gap-2">
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Transferring...
                                </>
                            ) : (
                                "Transfer to Seller"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default SellerFormModal;
