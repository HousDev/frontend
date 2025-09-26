// src/pages/dashboard/components/BuyerFormModal.tsx
import React, { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import { usersAPI } from "@/lib/api";
import { buyerTransferAPI } from "@/lib/buyerTransferAPI";
import { notificationAPI } from "@/lib/notificationAPI";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/contexts/AuthContext";

import { ChevronDown } from "lucide-react";
import BudgetRangeSelector from "@/components/ui/BudgetRangeSelector";
import { getAssignableExecutives } from "@/utils/roleBasedOptions";


type Lead = {
  id: string;
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
  // ... other lead fields as needed
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
  // ... other followup fields if available
};

interface BuyerFormModalProps {
  lead: Lead;
  followups?: Followup[]; // optional; will NOT be rendered — only console.logged
  onClose: () => void;
  onTransferSuccess?: (transferredBuyer: any) => void; // Optional callback for successful transfer
}

const BuyerFormModal: React.FC<BuyerFormModalProps> = ({
  lead,
  followups = [],
  onClose,
  onTransferSuccess
}) => {
  const { user } = useAuth();

  // UI toggles & refs
  const [showUnitTypeDropdown, setShowUnitTypeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showExecDropdown, setShowExecDropdown] = useState(false);
  const unitTypeButtonRef = useRef<HTMLDivElement | null>(null);
  const locationButtonRef = useRef<HTMLDivElement | null>(null);
  const execDropdownRef = useRef<HTMLDivElement | null>(null);

  // data
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({} as any);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [presalesUsers, setPresalesUsers] = useState<any[]>([]);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);

  // submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // form data
  const [formData, setFormData] = useState<any>({
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
    created_by: "",
    last_contact: "",
    last_contacted_by: "",

    // Buyer-specific editable fields
    budget_range: "",
    budget_range_readable: "",
    budget_min: 0,
    budget_max: 0,
    preferred_unit_type: [] as string[],
    preferred_location: [] as string[],
    property_subtype: "",
    property_type: "",
    assigned_executive: "",
    remark: "",
    nearbylocations: "",

    updated_at: "",
    is_active: true,
  });

  // Log followups (we accept but do not render)
  useEffect(() => {
    console.info("BuyerFormModal received followups:", followups);
  }, [followups]);

  // Load users and populate presales & sales lists
  useEffect(() => {
    (async () => {
      try {
        const resp = await usersAPI.getAllUsers?.();
        const users = resp?.data || [];
        setAllUsers(users);

        const norm = (s: any) =>
          (s ?? "")
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[\s-_/]+/g, "");

        // presales executives (kept if used elsewhere)
        const execsPresales = users.filter((u: any) => {
          const dept = norm(u?.department || u?.department_name);
          const role = norm(u?.role || u?.role_name);
          return dept === "presales" && role === "executive";
        });
        setPresalesUsers(execsPresales);

        // sales executives (NEW) — used in the assignment dropdown & notifications
        const execsSales = users.filter((u: any) => {
          const dept = norm(u?.department || u?.department_name);
          const role = norm(u?.role || u?.role_name);
          return dept === "sales" && role === "executive";
        });
        setSalesUsers(execsSales);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    })();
  }, []);

  // initialize form from lead
  useEffect(() => {
    if (!lead) return;

    let budgetMin = 0;
    let budgetMax = 0;

    if (lead["budget_min"] != null || lead["budget_max"] != null) {
      budgetMin = Number((lead as any).budget_min) || 0;
      budgetMax = Number((lead as any).budget_max) || 0;
    } else if ((lead as any).budget_range) {
      const parts = String((lead as any).budget_range).split("-").map((p) => parseFloat(p) || 0);
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
      created_at: lead.created_at ?? "",
      created_by: lead.created_by ?? "",
      last_contact: lead.last_contact ?? "",
      last_contacted_by: lead.last_contacted_by ?? "",

      budget_range: (lead as any).budget_range ?? (budgetMin || budgetMax ? `${budgetMin}-${budgetMax}` : ""),
      budget_range_readable: (lead as any).budget_range_readable ?? "",
      budget_min: budgetMin,
      budget_max: budgetMax,

      preferred_unit_type: (lead as any).preferred_unit_type ?? [],
      preferred_location: (lead as any).preferred_location ?? [],
      property_subtype: (lead as any).property_subtype ?? "",
      property_type: (lead as any).property_type ?? "",
      assigned_executive: (lead as any).assigned_executive ?? "",
      remark: (lead as any).remark ?? "",
      nearbylocations: (lead as any).nearbylocations ?? "",
      updated_at: (lead as any).updated_at ?? "",
      is_active: (lead as any).is_active != null ? !!(lead as any).is_active : true,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead]);

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

  const getOptionNames = (possibleKeys: string[]) => {
    for (const k of possibleKeys) {
      const arr = (masters as any)[k];
      if (Array.isArray(arr) && arr.length) {
        return arr.map((it: any) => (typeof it === "string" ? it : it.name ?? it.label ?? it.title ?? it.value ?? it.id));
      }
    }
    return [];
  };

  const locationOptions = getOptionNames(["location", "locations", "preferred_location", "locations_list"]);
  const unitTypeOptions = getOptionNames(["unit type", "unit_type", "unitType", "unit_types", "unitTypes"]);
  const propertySubtypeOptions = getOptionNames(["property subtype", "property_subtype", "propertySubtype", "property_subtypes"]);
  const propertyTypeOptions = getOptionNames(["property type", "property_type", "propertyType", "property_types"]);

  const getUserNameById = (id: string | number) => {
    if (!id) return "";
    const u = allUsers.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
    return u?.name || u?.full_name || u?.username || `${u?.first_name || ""} ${u?.last_name || ""}`.trim() || "";
  };

  // simple classes used in UI
  const wrapperClass = "border-2 border-green-400 rounded-lg p-2 mt-2 space-y-3 bg-white";
  const innerInputClass = "w-full border rounded h-9 px-2 text-xs bg-white focus:outline-none focus:border-green-600";
  const innerTextareaClass = "w-full border rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-green-600 resize-none";
  const execButtonClass = "w-full flex items-center justify-between space-x-1 border rounded p-1 text-xs bg-white hover:bg-gray-50";

  // Check if currently assigned executive is from sales department
  const isCurrentExecFromSales = () => {
    if (!formData?.assigned_executive) return false;
    
    const id = String(formData.assigned_executive);
    const salesExec = salesUsers.find((u) => String(u.id) === id || String(u._id) === id);
    return !!salesExec;
  };

  // Resolve assigned executive name preferring salesUsers then presalesUsers then allUsers
  const getAssignedExecName = () => {
    const leadExecName = (lead as any)?.assigned_executive_name;
    
    if (formData?.assigned_executive) {
      const id = String(formData.assigned_executive);
      
      // First check if assigned executive is from sales
      const salesExec = salesUsers.find((u) => String(u.id) === id || String(u._id) === id);
      if (salesExec) {
        return salesExec.name || salesExec.full_name || `${salesExec.first_name || ""} ${salesExec.last_name || ""}`.trim() || "Executive";
      }
      
      // If not from sales (i.e., from presales or other), show as "Unassigned" for sales assignment
      // Since this is a sales executive assignment dropdown, presales executives should appear as unassigned
      return "Unassigned (Currently Presales)";
    }
    
    // Fallback to lead executive name only if it's from sales
    if (leadExecName && String(leadExecName).trim() !== "" && leadExecName.toLowerCase() !== "unassigned") {
      // Check if this lead executive name belongs to a sales user
      const salesExecByName = salesUsers.find(u => {
        const userName = u.name || u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim();
        return userName.toLowerCase() === leadExecName.toLowerCase();
      });
      
      if (salesExecByName) {
        return leadExecName;
      }
      // If lead executive is not from sales, show as unassigned
      return "Unassigned (Currently Presales)";
    }
    
    return "Unassigned";
  };

  // Get available sales executives for dropdown
  const getAvailableSalesExecutives = () => {
    // Apply role-based filtering only to sales executives
    const filteredSalesExecs = getAssignableExecutives?.(user, salesUsers) ?? salesUsers;
    
    // Ensure we only return sales executives with proper name formatting
    const formattedExecs = filteredSalesExecs.filter(Boolean).map((exec: any) => ({
      ...exec,
      name: exec.name || exec.full_name || `${exec.first_name || ""} ${exec.last_name || ""}`.trim() || "Executive"
    }));
    
    // Check if current assigned executive is from sales department
    const currentExecId = String(formData.assigned_executive || "");
    const isCurrentFromSales = isCurrentExecFromSales();
    
    // If current executive is from sales, exclude them from dropdown (already assigned)
    if (isCurrentFromSales && currentExecId !== "") {
      return formattedExecs.filter((exec: any) => String(exec.id) !== currentExecId);
    }
    
    // If current executive is from presales (like Mohan Kumar) or no assignment, 
    // show all sales executives for assignment/reassignment
    return formattedExecs;
  };

  // Assign executive (use salesUsers first for name resolution/notification fallback to presales)
  const handleExecAssign = async (execId: string) => {
    try {
      const previousExec = formData.assigned_executive;

      setFormData((prev: any) => ({ ...prev, assigned_executive: execId }));
      setShowExecDropdown(false);

      if (execId && execId.trim() !== "") {
        const id = String(execId);
        // Prefer salesUsers for finding the user; fallback to presalesUsers and then allUsers
        const exec =
          salesUsers.find((u) => String(u.id) === id || String(u._id) === id) ||
          presalesUsers.find((u) => String(u.id) === id || String(u._id) === id) ||
          allUsers.find((u) => String(u.id) === id || String(u._id) === id);

        const execName = exec?.name || exec?.full_name || `${exec?.first_name || ""} ${exec?.last_name || ""}`.trim() || getUserNameById(execId) || "Executive";

        if (execId !== previousExec) {
          try {
            await notificationAPI.createNotification({
              leadId: Number(lead.id),
              userId: Number(execId),
              message: `Buyer lead assigned to ${execName}`,
              type: "buyer_assign",
              link: `/dashboard/buyers`,
              // link: `/dashboard/buyers/${lead.id}`,
            });
            console.log("✅ Assignment notification sent to executive:", execName);
          } catch (notifErr) {
            console.error("Failed to send notification:", notifErr);
            toast.warn("Executive assigned but notification failed to send");
          }
        }

        toast.success(`Buyer assigned to ${execName}`);
      } else {
        toast.success("Executive assignment removed");
      }
    } catch (err) {
      console.error("Error assigning executive:", err);
      toast.error("Failed to assign. Please try again.");
    }
  };

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

  const handleNearbyLocationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData((prev: any) => ({ ...prev, nearbylocations: value }));
  };

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData((prev: any) => ({ ...prev, remark: value }));
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

  // handle submit (transfer to buyer)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const parsedMin = Number(formData.budget_min) || 0;
    const parsedMax = Number(formData.budget_max) || 0;

    const requirements = {
      propertyType: formData.property_type || null,
      property_subtype: formData.property_subtype || null,
      unitTypes: Array.isArray(formData.preferred_unit_type) ? formData.preferred_unit_type : [],
      preferredLocations: Array.isArray(formData.preferred_location) ? formData.preferred_location : [],
      nearbylocations: formData.nearbylocations ?
        (typeof formData.nearbylocations === 'string'
          ? formData.nearbylocations.split(',').map(s => s.trim()).filter(s => s)
          : formData.nearbylocations
        ) : []
    };

    const {
      budget_range,
      budget_range_readable,
      property_type,
      property_subtype,
      preferred_unit_type,
      preferred_location,
      nearbylocations,
      ...rest
    } = formData;

    const overrides = {
      budget_min: parsedMin,
      budget_max: parsedMax,
      requirements,
      assigned_executive: formData.assigned_executive || null,
      updated_at: new Date().toISOString(),
      is_active: formData.is_active !== undefined ? !!formData.is_active : true,
      remark: formData.remark || "",
    };

    try {
      setIsSubmitting(true);

      console.log("🚀 Starting buyer transfer...");
      console.log("📋 Lead ID:", lead.id);
      console.log("📋 Requirements Object:", requirements);
      console.log("🔄 Overrides:", overrides);

      const response = await buyerTransferAPI.transferToBuyer({
        leadId: lead.id,
        overrides,
        createdBy: user?.id,
      });

      console.log("✅ Buyer transfer successful:", response);

      // Send notification to assigned executive (prefer salesUsers)
      if (formData.assigned_executive && String(formData.assigned_executive).trim() !== "") {
        try {
          const execId = String(formData.assigned_executive);
          const exec =
            salesUsers.find((u) => String(u.id) === execId || String(u._id) === execId) ||
            presalesUsers.find((u) => String(u.id) === execId || String(u._id) === execId) ||
            allUsers.find((u) => String(u.id) === execId || String(u._id) === execId);

          const execName = exec?.name || exec?.full_name || `${exec?.first_name || ""} ${exec?.last_name || ""}`.trim() || "Executive";

          await notificationAPI.createNotification({
            leadId: Number(lead.id),
            userId: Number(execId),
            message: `New buyer transferred and assigned to ${execName}`,
            type: "buyer_transfer",
            link: `/dashboard/buyers/${response?.data?.id || response?.id || lead.id}`,
          });

          console.log("✅ Transfer notification sent to executive:", execName);
        } catch (notifErr) {
          console.error("Failed to send transfer notification:", notifErr);
        }
      }

      // Notify lead creator (if different from current user)
      if (lead.created_by && String(lead.created_by) !== String(user?.id)) {
        try {
          await notificationAPI.createNotification({
            leadId: Number(lead.id),
            userId: Number(lead.created_by),
            message: `Your lead "${lead.name}" has been transferred to buyer`,
            type: "lead_transfer",
            link: `/dashboard/buyers/${response?.data?.id || response?.id || lead.id}`,
          });
          console.log("✅ Transfer notification sent to lead creator");
        } catch (notifErr) {
          console.error("Failed to send creator notification:", notifErr);
        }
      }

      toast.success("Lead successfully transferred to buyer!");

      if (onTransferSuccess && response) {
        onTransferSuccess(response);
      }

      onClose();
    } catch (error: any) {
      console.error("❌ Buyer transfer failed:", error);
      if (error?.response?.data?.message) {
        toast.error(`Transfer failed: ${error.response.data.message}`);
      } else if (error?.message) {
        toast.error(`Transfer failed: ${error.message}`);
      } else {
        toast.error("Failed to transfer lead to buyer. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Transfer to Buyer" width="max-w-4xl">
      <div className="text-xs">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="space-y-2 p-2">
              {/* Basic Details read-only */}
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

              {/* Lead meta (read-only) */}
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
                  <label className="block text-xs font-medium">Created By</label>
                  <input
                    type="text"
                    name="created_by"
                    value={
                      (lead as any)?.created_by_name ||
                      getUserNameById(formData.created_by) ||
                      formData.created_by ||
                      ""
                    }
                    readOnly
                    className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs"
                  />
                </div>
              </div>
            </div>

            <div className={wrapperClass}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium">Property Type</label>
                  <select name="property_type" value={formData.property_type} onChange={handleChange} className={innerInputClass}>
                    <option value="">Select Property Type</option>
                    {propertyTypeOptions.length > 0 ? propertyTypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>) : <>
                      <option value="Commercial">Commercial</option>
                      <option value="Residential">Residential</option>
                    </>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium">Property Subtype</label>
                  <select name="property_subtype" value={formData.property_subtype} onChange={handleChange} className={innerInputClass}>
                    <option value="">Select Property Subtype</option>
                    {propertySubtypeOptions.length > 0 ? propertySubtypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>) : <>
                      <option value="Apartment">Apartment</option>
                      <option value="Row House">Row House</option>
                      <option value="Plot">Plot</option>
                    </>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-green-700">Assigned Sales Executive</label>
                  <div className="relative" ref={execDropdownRef}>
                    <button type="button" onClick={() => setShowExecDropdown(!showExecDropdown)} className={execButtonClass}>
                      <span className="truncate text-xs">{getAssignedExecName()}</span>
                      <ChevronDown className="w-3 h-3 flex-shrink-0" />
                    </button>

                    {showExecDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border z-[9999] text-xs">
                        <div className="p-2">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wide px-2 py-1 border-b truncate">Assign to Sales Executive</div>

                          {(() => {
                            // Get only sales executives for dropdown
                            const availableSalesExecs = getAvailableSalesExecutives();
                            
                            if (!availableSalesExecs || availableSalesExecs.length === 0) {
                              return <div className="px-2 py-2 text-xs text-gray-500">No sales executives available</div>;
                            }
                            
                            return (
                              <>
                                <button
                                  key="unassigned"
                                  type="button"
                                  onClick={() => handleExecAssign("")}
                                  className={`w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-xs truncate ${
                                    !formData.assigned_executive || formData.assigned_executive === ""
                                      ? "bg-blue-50 text-blue-600 font-medium"
                                      : "text-gray-800"
                                  }`}
                                >
                                  Unassigned
                                </button>

                                {availableSalesExecs.map((exec: any) => (
                                  <button
                                    key={exec.id}
                                    type="button"
                                    onClick={() => handleExecAssign(String(exec.id))}
                                    className={`w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-xs truncate ${
                                      String(formData.assigned_executive) === String(exec.id)
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {exec.name}
                                    {exec.selfOnly && (
                                      <span className="text-[10px] text-gray-400 ml-1">(Self)</span>
                                    )}
                                  </button>
                                ))}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2">
                <div className="relative grid">
                  <label className="block text-xs font-medium mb-1">Preferred Unit Type</label>
                  <div>
                    <div ref={unitTypeButtonRef} role="button" tabIndex={0} onClick={handleUnitTypeToggle} className={execButtonClass}>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {formData.preferred_unit_type?.length > 0 ? formData.preferred_unit_type.map((item: string) => (
                          <span key={item} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            <span>{item}</span>
                            <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); handleCheckboxChange("preferred_unit_type", item); }} className="ml-1 text-blue-600 hover:text-blue-800 text-xs cursor-pointer" aria-label={`Remove ${item}`}>×</span>
                          </span>
                        )) : <span className="text-xs">Select Unit Types</span>}
                      </div>
                      <span className="text-gray-500 ml-2">▼</span>
                    </div>

                    {showUnitTypeDropdown && unitTypeButtonRef.current && (
                      <div className="bg-white border rounded shadow-lg text-xs" style={{
                        position: "fixed",
                        zIndex: 9999,
                        top: unitTypeButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
                        left: unitTypeButtonRef.current.getBoundingClientRect().left + window.scrollX,
                        width: unitTypeButtonRef.current.getBoundingClientRect().width,
                      }}>
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

                <div className="relative">
                  <label className="block text-xs font-medium mb-1">Preferred Location</label>
                  <div>
                    <div ref={locationButtonRef} role="button" tabIndex={0} onClick={handleLocationToggle} className={execButtonClass}>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {formData.preferred_location?.length > 0 ? formData.preferred_location.map((item: string) => (
                          <span key={item} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            <span>{item}</span>
                            <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); handleCheckboxChange("preferred_location", item); }} className="ml-1 text-green-600 hover:text-green-800 cursor-pointer text-xs" aria-label={`Remove ${item}`}>×</span>
                          </span>
                        )) : <span className="text-xs">Select Locations</span>}
                      </div>
                      <span className="text-gray-500 ml-2">▼</span>
                    </div>

                    {showLocationDropdown && locationButtonRef.current && (
                      <div className="bg-white border rounded shadow-lg max-h-40 overflow-y-auto text-xs" style={{
                        position: "fixed",
                        zIndex: 9999,
                        top: locationButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
                        left: locationButtonRef.current.getBoundingClientRect().left + window.scrollX,
                        width: locationButtonRef.current.getBoundingClientRect().width,
                      }}>
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
                        budget_range: `${minNum}-${maxNum}`,
                        budget_range_readable: readable,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 items-start">
                <div className="flex flex-col h-full">
                  <label htmlFor="nearbylocations" className="block text-xs font-medium text-gray-700 mb-1">Nearby Location</label>
                  <textarea id="nearbylocations" name="nearbylocations" value={formData.nearbylocations} onChange={handleNearbyLocationsChange} rows={3} placeholder="e.g. Near City Mall, beside Community Park" className={innerTextareaClass} />
                </div>

                <div className="flex flex-col h-full">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Buyer Remark</label>
                  <textarea name="remark" value={formData.remark} onChange={handleRemarkChange} rows={3} placeholder="Add any buyer remarks here..." className={innerTextareaClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1 bg-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Transfer to Buyer"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BuyerFormModal;