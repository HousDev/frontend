// src/pages/dashboard/components/BuyerFormModal.tsx
import Modal from "@/components/ui/Modal";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import { usersAPI } from "@/lib/api";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignableExecutives } from "@/pages/utils/roleBasedOptions";
import { ChevronDown } from "lucide-react";
import BudgetRangeSelector from "@/components/ui/BudgetRangeSelector";

interface BuyerFormModalProps {
  lead: any;
  onClose: () => void;
}

const BuyerFormModal: React.FC<BuyerFormModalProps> = ({ lead, onClose }) => {
  const { user } = useAuth();

  const [showUnitTypeDropdown, setShowUnitTypeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showExecDropdown, setShowExecDropdown] = useState(false);

  const unitTypeButtonRef = useRef<HTMLDivElement | null>(null);
  const locationButtonRef = useRef<HTMLDivElement | null>(null);
  const execDropdownRef = useRef<HTMLDivElement | null>(null);

  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>([] as any);

  // all users (for resolving ids -> names when showing in UI; not stored in form)
  const [allUsers, setAllUsers] = useState<any[]>([]);
  // presales subset for assigning executives
  const [presalesUsers, setPresalesUsers] = useState<any[]>([]);

  // load all users (and set presales subset)
  useEffect(() => {
    (async () => {
      try {
        const resp = await usersAPI.getAllUsers?.();
        const users = resp?.data || [];
        setAllUsers(users);

        const execs = users.filter(
          (u: any) =>
            (u?.department || "").toLowerCase() === "presales" &&
            (u?.role || "").toLowerCase() === "executive"
        );
        setPresalesUsers(execs);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    })();
  }, []);

  const [formData, setFormData] = useState<any>({
    // basic contact & lead fields (mostly read-only in UI)
    salutation: "",
    name: "",
    phone: "",
    whatsapp_number: "",
    email: "",
    city: "",
    state: "",
    location: "",
    lead_source: "",
    lead_type: "",
    priority: "",
    status: "",
    stage: "",
    created_at: "",
    created_by: "", // id (if present)
    last_contact: "",
    last_contacted_by: "", // id

    // Buyer specific fields
    budget_range: "", // kept in state but will NOT be sent (raw string)
    budget_range_readable: "", // human readable - kept for UI only (WILL NOT be sent)
    budget_min: 0, // numeric (in Crores) - WILL be sent
    budget_max: 0, // numeric (in Crores) - WILL be sent
    preferred_unit_type: [] as string[],
    preferred_location: [] as string[],
    property_subtype: "",
    property_type: "",
    assigned_executive: "", // id only
    buyer_remark: "",
    nearbylocations: "",

    // metadata
    updated_at: "",
    buyer_lead_status: "",
    is_active: true, // always send true by default per request
  });

  // helper to get user name by id from allUsers
  const getUserNameById = (id: string | number) => {
    if (!id) return "";
    const u = allUsers.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
    return u?.name || u?.full_name || u?.username || "";
  };

  // initialize form from lead
  useEffect(() => {
    if (!lead) return;

    // try to parse budget_range into min/max numbers if present
    let budgetMin = 0;
    let budgetMax = 0;
    if (lead?.budget_min != null || lead?.budget_max != null) {
      // prefer explicit numeric fields if present
      budgetMin = Number(lead.budget_min) || 0;
      budgetMax = Number(lead.budget_max) || 0;
    } else if (lead?.budget_range) {
      const parts = String(lead.budget_range).split("-").map((p: string) => parseFloat(p) || 0);
      budgetMin = parts[0] ?? 0;
      budgetMax = parts[1] ?? parts[0] ?? 0;
    }

    setFormData((prev: any) => ({
      ...prev,
      salutation: lead.salutation ?? "",
      name: lead.name ?? "",
      phone: lead.phone ?? "",
      whatsapp_number: lead.whatsapp_number ?? "",
      email: lead.email ?? "",
      city: lead.city ?? "",
      state: lead.state ?? "",
      location: lead.location ?? "",
      lead_source: lead.lead_source ?? "",
      lead_type: lead.lead_type ?? "",
      priority: lead.priority ?? "",
      status: lead.status ?? "",
      stage: lead.stage ?? "",
      created_at: lead.created_at ?? new Date().toISOString(),
      created_by: lead.created_by ?? "",
      last_contact: lead.last_contact ?? "",
      last_contacted_by: lead.last_contacted_by ?? "",

      // keep budget_range / readable in UI state but budget_range (raw) & readable won't be sent
      budget_range: lead.budget_range ?? (budgetMin || budgetMax ? `${budgetMin}-${budgetMax}` : ""),
      budget_range_readable: lead.budget_range_readable ?? "", // UI only
      budget_min: budgetMin,
      budget_max: budgetMax,
      preferred_unit_type: lead.preferred_unit_type ?? [],
      preferred_location: lead.preferred_location ?? [],
      property_subtype: lead.property_subtype ?? "",
      property_type: lead.property_type ?? "",
      assigned_executive: lead.assigned_executive ?? "",
      buyer_remark: lead.buyer_remark ?? "",
      nearbylocations: lead.nearbylocations ?? "",
      updated_at: lead.updated_at ?? "",
      buyer_lead_status: lead.buyer_lead_status ?? "",
      is_active: lead.is_active != null ? !!lead.is_active : true,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead]);

  // NOTE: removed effects that previously resolved and stored *_name fields in state.
  // We will resolve names for display only via getUserNameById or presalesUsers lookup.

  const getAssignedExecName = () => {
    if (formData?.assigned_executive) {
      const exec = presalesUsers.find(
        (u) => String(u.id) === String(formData.assigned_executive) || String(u._id) === String(formData.assigned_executive)
      );
      return exec?.name || getUserNameById(formData.assigned_executive) || "Unassigned";
    }
    return "Unassigned";
  };

  const handleExecAssign = async (execId: string) => {
    try {
      setFormData((prev: any) => ({
        ...prev,
        assigned_executive: execId,
      }));
      setShowExecDropdown(false);
      const name = getUserNameById(execId) || presalesUsers.find((u) => String(u.id) === String(execId))?.name || "Executive";
      toast.success(`Buyer assigned to ${name}`);
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

  // fetch masters
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

  const locationOptions = getOptionNames(["location", "locations", "preferred_location", "locations_list"]);
  const unitTypeOptions = getOptionNames(["unit type", "unit_type", "unitType", "unit_types", "unitTypes"]);
  const propertySubtypeOptions = getOptionNames(["property subtype", "property_subtype", "propertySubtype", "property_subtypes"]);
  const propertyTypeOptions = getOptionNames(["property type", "property_type", "propertyType", "property_types"]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string) => {
    setFormData((prev: any) => {
      const currentArray: string[] = prev[name] ?? [];
      const updatedArray = currentArray.includes(value) ? currentArray.filter((item) => item !== value) : [...currentArray, value];
      return { ...prev, [name]: updatedArray };
    });
  };

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData((prev: any) => ({ ...prev, buyer_remark: value }));
  };

  const handleNearbyLocationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData((prev: any) => ({ ...prev, nearbylocations: value }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure updated_at and numeric budget_min/budget_max are present
    const parsedMin = Number(formData.budget_min) || 0;
    const parsedMax = Number(formData.budget_max) || 0;

    // Remove only budget_range (raw) and budget_range_readable from payload — they are UI-only
    const { budget_range, budget_range_readable, ...rest } = formData;

    const submissionData = {
      ...rest,
      // numeric fields
      budget_min: parsedMin,
      budget_max: parsedMax,
      updated_at: new Date().toISOString(),
      buyer_lead_status: formData.buyer_lead_status ,
      is_active: formData.is_active !== undefined ? !!formData.is_active : true,
    };

    // Note: we are NOT including created_by_name / last_contacted_by_name / assigned_executive_name — only IDs.
    console.log("🚀 Buyer Form Submitted (min/max, ids only):", submissionData);
    toast.success("Buyer information saved successfully!");
    onClose();
  };

  // Small reusable classes
  const wrapperClass = "border-2 border-green-400 rounded-lg p-2 mt-2 space-y-3 bg-white";
  const innerInputClass = "w-full border rounded h-9 px-2 text-xs bg-white focus:outline-none focus:border-green-600";
  const innerTextareaClass = "w-full border rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-green-600 resize-none";
  const execButtonClass = "w-full flex items-center justify-between space-x-1 border rounded p-1 text-xs bg-white hover:bg-gray-50";

  return (
    <Modal isOpen={true} onClose={onClose} title="Buyer Form" width="max-w-4xl">
      <div className="text-xs">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Wrap all editable areas inside one big bordered wrapper */}
          <div>
            <div className="space-y-2 p-2">
              {/* Basic Details - Read-only */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Salutation</label>
                  <input type="text" name="salutation" value={formData.salutation} readOnly className="border border-gray-300 rounded w-full h-8 px-1 text-xs bg-gray-100 cursor-not-allowed focus:outline-none" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" name="name" value={formData.name} readOnly className="border border-gray-300 rounded w-full h-8 px-1 text-xs bg-gray-100 cursor-not-allowed focus:outline-none" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium">Phone</label>
                  <input type="text" name="phone" value={formData.phone} readOnly className="border border-gray-300 rounded w-full h-8 px-1 text-xs bg-gray-100 cursor-not-allowed focus:outline-none" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium">WhatsApp Number</label>
                  <input type="text" name="whatsapp_number" value={formData.whatsapp_number} readOnly className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs" />
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium">Email</label>
                  <input type="email" name="email" value={formData.email} readOnly className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium">State</label>
                  <input type="text" name="state" value={formData.state} readOnly className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium">City</label>
                  <input type="text" name="city" value={formData.city} readOnly className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium">Location</label>
                  <input type="text" name="location" value={formData.location} readOnly className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs" />
                </div>
              </div>

              {/* Lead Details - Read-only */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium">Lead Source</label>
                  <input type="text" name="lead_source" value={formData.lead_source} readOnly className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium">Lead Type</label>
                  <input type="text" name="lead_type" value={formData.lead_type} readOnly className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium">Status</label>
                  <input type="text" name="status" value={formData.status} readOnly className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium">Created By (ID)</label>
                  <input type="text" name="created_by" value={formData.created_by || ""} readOnly className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs" />
                </div>
              </div>
            </div>

            <div className={` ${wrapperClass}`}>
              {/* Buyer Specific - Editable fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 ">
                <div>
                  <label className="block text-xs font-medium">Property Type</label>
                  <select name="property_type" value={formData.property_type} onChange={handleChange} className={innerInputClass}>
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
                </div>

                <div>
                  <label className="block text-xs font-medium">Property Subtype</label>
                  <select name="property_subtype" value={formData.property_subtype} onChange={handleChange} className={innerInputClass}>
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
                </div>

                {/* Assign Executive */}
                <div>
                  <label className="block text-xs font-medium text-green-700">Assigned Executive</label>
                  <div className="relative" ref={execDropdownRef}>
                    <button type="button" onClick={() => setShowExecDropdown(!showExecDropdown)} className={execButtonClass}>
                      <span className="truncate text-xs">{getAssignedExecName()}</span>
                      <ChevronDown className="w-3 h-3 flex-shrink-0" />
                    </button>

                    {showExecDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border z-[9999] text-xs">
                        <div className="p-2">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wide px-2 py-1 border-b truncate">Assign to Executive</div>

                          {(() => {
                            const execs = getAssignableExecutives(user, presalesUsers);

                            if (execs.length === 0) {
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
                                className={`w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-xs truncate ${
                                  String(formData.assigned_executive) === String(exec.id) ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-800"
                                }`}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2">
                {/* Preferred Unit Type */}
                <div className="relative grid">
                  <label className="block text-xs font-medium mb-1 ">Preferred Unit Type</label>
                  <div>
                    <div
                      ref={unitTypeButtonRef}
                      role="button"
                      tabIndex={0}
                      onClick={handleUnitTypeToggle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleUnitTypeToggle();
                        }
                      }}
                      className={execButtonClass}
                    >
                      <div className="flex flex-wrap gap-1 text-xs">
                        {formData.preferred_unit_type?.length > 0 ? (
                          formData.preferred_unit_type.map((item: string) => (
                            <span key={item} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              <span>{item}</span>
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxChange("preferred_unit_type", item);
                                }}
                                onKeyDown={(e) => {
                                  if ((e as any).key === "Enter" || (e as any).key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCheckboxChange("preferred_unit_type", item);
                                  }
                                }}
                                className="ml-1 text-blue-600 hover:text-blue-800 text-xs cursor-pointer"
                                aria-label={`Remove ${item}`}
                              >
                                ×
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs">Select Unit Types</span>
                        )}
                      </div>
                      <span className="text-gray-500 ml-2">▼</span>
                    </div>

                    {showUnitTypeDropdown && unitTypeButtonRef.current && (
                      <div
                        className="bg-white border rounded shadow-lg text-xs"
                        style={{
                          position: "fixed",
                          zIndex: 9999,
                          top: unitTypeButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
                          left: unitTypeButtonRef.current.getBoundingClientRect().left + window.scrollX,
                          width: unitTypeButtonRef.current.getBoundingClientRect().width,
                        }}
                      >
                        {(unitTypeOptions.length > 0 ? unitTypeOptions : ["1BHK", "2BHK", "3BHK", "Villa"]).map((unitType) => (
                          <label key={unitType} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer text-xs">
                            <input type="checkbox" checked={formData.preferred_unit_type?.includes(unitType)} onChange={() => handleCheckboxChange("preferred_unit_type", unitType)} className="mr-2 h-3 w-3" />
                            <span className="text-xs">{unitType}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferred Location */}
                <div className="relative">
                  <label className="block text-xs font-medium mb-1">Preferred Location</label>
                  <div>
                    <div
                      ref={locationButtonRef}
                      role="button"
                      tabIndex={0}
                      onClick={handleLocationToggle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleLocationToggle();
                        }
                      }}
                      className={execButtonClass}
                    >
                      <div className="flex flex-wrap gap-1 text-xs">
                        {formData.preferred_location?.length > 0 ? (
                          formData.preferred_location.map((item: string) => (
                            <span key={item} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              <span>{item}</span>
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxChange("preferred_location", item);
                                }}
                                onKeyDown={(e) => {
                                  if ((e as any).key === "Enter" || (e as any).key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCheckboxChange("preferred_location", item);
                                  }
                                }}
                                className="ml-1 text-green-600 hover:text-green-800 cursor-pointer text-xs"
                                aria-label={`Remove ${item}`}
                              >
                                ×
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs">Select Locations</span>
                        )}
                      </div>
                      <span className="text-gray-500 ml-2">▼</span>
                    </div>

                    {showLocationDropdown && locationButtonRef.current && (
                      <div
                        className="bg-white border rounded shadow-lg max-h-40 overflow-y-auto text-xs"
                        style={{
                          position: "fixed",
                          zIndex: 9999,
                          top: locationButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
                          left: locationButtonRef.current.getBoundingClientRect().left + window.scrollX,
                          width: locationButtonRef.current.getBoundingClientRect().width,
                        }}
                      >
                        {(locationOptions.length > 0 ? locationOptions : ["Hinjewadi", "Baner", "Wakad", "Pune"]).map((location) => (
                          <label key={location} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer text-xs">
                            <input type="checkbox" checked={formData.preferred_location?.includes(location)} onChange={() => handleCheckboxChange("preferred_location", location)} className="mr-2 h-3 w-3" />
                            <span className="text-xs">{location}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget Range (inside wrapper) */}
              <div>
                <label className="block text-xs font-medium">Budget Range</label>
                <div className="mt-2">
                  <BudgetRangeSelector
                    initialMin={Number(formData?.budget_min) || (formData?.budget_range ? parseFloat(String(formData.budget_range).split("-")[0]) || 0.32 : 0.32)}
                    initialMax={Number(formData?.budget_max) || (formData?.budget_range ? parseFloat(String(formData.budget_range).split("-")[1]) || 4.95 : 4.95)}
                    max={50}
                    onChange={({ min, max: maxV, readable }) => {
                      const minNum = Number(min) || 0;
                      const maxNum = Number(maxV) || minNum;
                      setFormData((prev: any) => ({
                        ...prev,
                        budget_min: minNum,
                        budget_max: maxNum,
                        // keep the string/readable in state for UI only
                        budget_range: `${minNum}-${maxNum}`,
                        budget_range_readable: readable,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 items-start">
                {/* Nearby Location (editable) */}
                <div className="flex flex-col h-full">
                  <label htmlFor="nearbylocations" className="block text-xs font-medium text-gray-700 mb-1">
                    Nearby Location
                  </label>
                  <textarea id="nearbylocations" name="nearbylocations" value={formData.nearbylocations} onChange={handleNearbyLocationsChange} rows={3} placeholder="e.g. Near City Mall, beside Community Park" className={innerTextareaClass} />
                </div>

                {/* Buyer Remark (editable) */}
                <div className="flex flex-col h-full">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Buyer Remark</label>
                  <textarea name="buyer_remark" value={formData.buyer_remark} onChange={handleRemarkChange} rows={3} placeholder="Add any buyer remarks here..." className={innerTextareaClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-1">
            <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-300 rounded text-xs">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-xs">
              Transfer to Buyer
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BuyerFormModal;
