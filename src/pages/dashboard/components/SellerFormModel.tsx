// src/pages/dashboard/components/SellerFormModal.tsx
import React, { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";
import { notificationAPI } from "@/lib/notificationAPI";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import { getAssignableExecutives } from "@/utils/roleBasedOptions";
import { toast } from "react-toastify";
import PriceRangeSelector from "@/components/ui/PriceRangeSelector";
import sellerTransferAPI from "@/lib/sellerTransferAPI";

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
  created_by?: string | number;
  last_contact?: string;
  last_contacted_by?: string;
  updated_at?: string;
  is_active?: boolean | null;
  assigned_executive?: string | number;
  created_by_name?: string;
  assigned_executive_name?: string;
  assignment_notification_id?: number;
  notification_id?: number;
};

interface SellerFormModalProps {
  lead: Lead;
  followups?: any[];
  onClose?: () => void;
  onTransferSuccess?: (transferredSeller: any) => void;
  isOpen?: boolean;
}

const CRORE_TO_RUPEE = 10_000_000;
const noop = () => {};

/** ---------- Helper: /dashboard/leads/<id> ---------- */
function buildLeadPath(basePrefix: string, leadId?: string | number) {
  const id = leadId != null ? String(leadId) : "";
  const base = (basePrefix || "/dashboard/leads").replace(/\/+$/g, "");
  if (!id) return base;
  return `${base}/${encodeURIComponent(id)}`;
}

const SellerFormModal: React.FC<SellerFormModalProps> = ({
  lead,
  followups = [],
  onClose = noop,
  onTransferSuccess,
  isOpen = true,
}) => {
  const { user } = useAuth();

  // --- UI helpers ---
  const wrapperClass =
    "border-2 border-green-400 rounded-lg p-2 mt-2 space-y-3 bg-white";
  const innerInputClass =
    "w-full border rounded h-9 px-2 text-xs bg-white focus:outline-none focus:border-green-600";
  const innerTextareaClass =
    "w-full border rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-green-600 resize-none";
  const execButtonClass =
    "w-full flex items-center justify-between space-x-1 border rounded p-1 text-xs bg-white hover:bg-gray-50";

  // --- dropdown refs/state (exec dropdown) ---
  const [showExecDropdown, setShowExecDropdown] = useState(false);
  const execDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (
        execDropdownRef.current &&
        !execDropdownRef.current.contains(target) &&
        showExecDropdown
      ) {
        setShowExecDropdown(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [showExecDropdown]);

  // --- masters ---
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>(
    {} as any
  );

  useEffect(() => {
    (async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(["property", "common"]);
        setMasters(data as any);
      } catch (e) {
        console.error("Masters load failed:", e);
      } finally {
        setMasterLoading(false);
      }
    })();
  }, []);

  const getOptionNames = (possibleKeys: string[]) => {
    for (const k of possibleKeys) {
      const arr = (masters as any)[k];
      if (Array.isArray(arr) && arr.length) {
        return arr.map((it: any) =>
          typeof it === "string"
            ? it
            : it.name ?? it.label ?? it.title ?? it.value ?? it.id
        );
      }
    }
    return [];
  };

  const propertyTypeOptions = getOptionNames([
    "property type",
    "property_type",
    "propertyType",
    "property_types",
  ]);
  const propertySubtypeOptions = getOptionNames([
    "property subtype",
    "property_subtype",
    "propertySubtype",
    "property_subtypes",
  ]);
  const unitTypeOptions = getOptionNames([
    "unit type",
    "unit_type",
    "unitType",
    "unit_types",
    "unitTypes",
  ]);
  const locationNameOptions = getOptionNames([
    "location name",
    "location_name",
    "location",
    "locations",
    "locations_list",
  ]);
  const societyNameOptions = getOptionNames([
    "society",
    "society_name",
    "societies",
    "society_list",
  ]);
  const cityNameOptions = getOptionNames([
    "city name",
    "city_name",
    "city",
    "cities",
    "city_list",
  ]);

  // --- users (sales exec focus) ---
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [presalesUsers, setPresalesUsers] = useState<any[]>([]);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);

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

        const execsPresales = users.filter((u: any) => {
          const dept = norm(u?.department || u?.department_name);
          const role = norm(u?.role || u?.role_name);
          return dept === "presales" && role === "executive";
        });
        setPresalesUsers(execsPresales);

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

  const getUserNameById = (id: string | number) => {
    if (!id) return "";
    const u = allUsers.find(
      (x) => String(x.id) === String(id) || String(x._id) === String(id)
    );
    return (
      u?.name ||
      u?.full_name ||
      u?.username ||
      `${u?.first_name || ""} ${u?.last_name || ""}`.trim() ||
      ""
    );
  };

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
    updated_at: "",
    is_active: true,
    assigned_executive: "",
    // seller specific
    property_type: "",
    property_subtype: "",
    unit_type: "",
    society_name: "",
    location_name: "",
    city_name: "",
    carpet_area: "",
    seller_remark: "",
    id: "",
    // price fields
    price_min_cr: 0.01,
    price_max_cr: 0.01,
    price_max_rupees: 100_000,
    price_readable: "1L",
  });

  const isCurrentExecFromSales = () => {
    if (!formData?.assigned_executive) return false;
    const id = String(formData.assigned_executive);
    const salesExec = salesUsers.find(
      (u) => String(u.id) === id || String(u._id) === id
    );
    return !!salesExec;
  };

  const getAssignedExecName = () => {
    const leadExecName = (lead as any)?.assigned_executive_name;
    if (formData?.assigned_executive) {
      const id = String(formData.assigned_executive);
      const salesExec =
        salesUsers.find((u) => String(u.id) === id || String(u._id) === id) ||
        null;
      if (salesExec) {
        return (
          salesExec.name ||
          salesExec.full_name ||
          `${salesExec.first_name || ""} ${salesExec.last_name || ""}`.trim() ||
          "Executive"
        );
      }
      return "Unassigned (Currently Presales)";
    }
    if (
      leadExecName &&
      String(leadExecName).trim() !== "" &&
      leadExecName.toLowerCase() !== "unassigned"
    ) {
      const salesExecByName = salesUsers.find((u) => {
        const nm =
          u.name ||
          u.full_name ||
          `${u.first_name || ""} ${u.last_name || ""}`.trim();
        return String(nm || "").toLowerCase() === leadExecName.toLowerCase();
      });
      if (salesExecByName) return leadExecName;
      return "Unassigned (Currently Presales)";
    }
    return "Unassigned";
  };

  const getAvailableSalesExecutives = () => {
    const filteredSalesExecs =
      getAssignableExecutives?.(user, salesUsers) ?? salesUsers;

    const formattedExecs = filteredSalesExecs
      .filter(Boolean)
      .map((exec: any) => ({
        ...exec,
        name:
          exec.name ||
          exec.full_name ||
          `${exec.first_name || ""} ${exec.last_name || ""}`.trim() ||
          "Executive",
      }));

    const currentExecId = String(formData.assigned_executive || "");
    const isCurrentFromSales = isCurrentExecFromSales();

    if (isCurrentFromSales && currentExecId !== "") {
      return formattedExecs.filter((e: any) => String(e.id) !== currentExecId);
    }
    return formattedExecs;
  };

  // Use UPDATE notification API (with fallback)
  const notifyAssignOrUpdate = async ({
    userId,
    message,
    type,
    link,
  }: {
    userId: number;
    message: string;
    type?: string;
    link?: string;
  }) => {
    const maybeId =
      Number(
        (lead as any)?.assignment_notification_id ??
          (lead as any)?.notification_id ??
          0
      ) || null;

    const safeLink =
      link && link.trim().length
        ? buildLeadPath(link, lead?.id)
        : buildLeadPath("/dashboard/leads", lead?.id);

    await notificationAPI.updateNotification(maybeId, {
      leadId: String(lead.id),
      userId,
      message,
      type,
      link: safeLink,
    });
  };

  const handleExecAssign = async (execId: string) => {
    try {
      const previousExec = formData.assigned_executive;
      setFormData((p: any) => ({ ...p, assigned_executive: execId }));
      setShowExecDropdown(false);

      if (execId && execId.trim() !== "") {
        const id = String(execId);
        const exec =
          salesUsers.find((u) => String(u.id) === id || String(u._id) === id) ||
          presalesUsers.find(
            (u) => String(u.id) === id || String(u._id) === id
          ) ||
          allUsers.find((u) => String(u.id) === id || String(u._id) === id);

        const execName =
          exec?.name ||
          exec?.full_name ||
          `${exec?.first_name || ""} ${exec?.last_name || ""}`.trim() ||
          getUserNameById(execId) ||
          "Executive";

        if (execId !== previousExec) {
          try {
            await notifyAssignOrUpdate({
              userId: Number(execId),
              message: `Seller lead assigned to ${execName}`,
              type: "seller_assign",
              link: "/dashboard/leads",
            });
       
          } catch (e) {
            console.error("Notification update failed:", e);
            toast.warn("Executive assigned but notification update failed");
          }
        }
        toast.success(`Seller assigned to ${execName}`);
      } else {
        toast.success("Executive assignment removed");
      }
    } catch (e) {
      console.error("Assign error:", e);
      toast.error("Failed to assign. Please try again.");
    }
  };

  // init from lead
  useEffect(() => {
    if (!lead) return;
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
      updated_at: (lead as any).updated_at ?? new Date().toISOString(),
      is_active:
        (lead as any).is_active != null ? !!(lead as any).is_active : true,
      assigned_executive: (lead as any).assigned_executive ?? "",
      // prefill new seller fields if present on lead:
      unit_type: (lead as any).unit_type ?? prev.unit_type,
      society_name: (lead as any).society_name ?? prev.society_name,
      location_name: (lead as any).location_name ?? prev.location_name,
      city_name: (lead as any).city_name ?? prev.city_name,
      carpet_area: (lead as any).carpet_area ?? prev.carpet_area,
      id: lead.id ?? "",
      // price fields from lead if available
      price_min_cr: (lead as any)?.price_min_cr ?? prev.price_min_cr,
      price_max_cr: (lead as any)?.price_max_cr ?? prev.price_max_cr,
      price_max_rupees:
        (lead as any)?.price_max_rupees ??
        Math.round(
          ((lead as any)?.price_max_cr ?? prev.price_max_cr) * CRORE_TO_RUPEE
        ),
      price_readable: (lead as any)?.price_readable ?? prev.price_readable,
    }));
  }, [lead]);

  // log followups (optional)
  useEffect(() => {
    if (!followups?.length) return;
    try {
      const light = followups.map((f: any) => ({
        id: f?.id,
        type: f?.type,
        remark: f?.remark ?? f?.customRemark,
        nextAction: f?.next_action ?? f?.nextAction,
        scheduledDate: f?.scheduledDate ?? f?.scheduled_date,
        priority: f?.priority,
        stage: f?.stage,
        status: f?.status,
        createdAt: f?.createdAt ?? f?.created_at,
      }));
 
    } catch {
  
    }
  }, [followups]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedPayload, setSubmittedPayload] = useState<any | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? !!checked : value,
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name || String(formData.name).trim().length < 2)
      errs.name = "Name is required";
    if (!formData.phone || String(formData.phone).trim().length < 6)
      errs.phone = "Valid phone required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ---------- small date helpers (no 1970 defaults) ----------
  const toDate = (v: any) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const toSqlDate = (d: Date | null) =>
    d
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`
      : null;
  const toSqlTime = (d: Date | null) =>
    d
      ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
          2,
          "0"
        )}:${String(d.getSeconds()).padStart(2, "0")}`
      : null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // === Build "seller" object ===
      const assignedToId =
        formData.assigned_executive &&
        String(formData.assigned_executive).trim() !== ""
          ? Number(formData.assigned_executive)
          : null;

      const assignedToName = (() => {
        if (!assignedToId) return null;
        const exec =
          salesUsers.find((u) => Number(u.id) === assignedToId) ||
          presalesUsers.find((u) => Number(u.id) === assignedToId) ||
          allUsers.find((u) => Number(u.id) === assignedToId);
        return (
          exec?.name ||
          exec?.full_name ||
          `${exec?.first_name || ""} ${exec?.last_name || ""}`.trim() ||
          null
        );
      })();

      const nowIso = new Date().toISOString();

      const seller = {
        salutation: formData.salutation || null,
        name: formData.name || null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp_number || null,
        email: formData.email || null,
        state: formData.state || null,
        city: formData.city || null,
        location: formData.location || null,
        countryCode: null,

        stage: formData.stage || null,
        leadType: formData.lead_type || null,
        priority: formData.priority || null,
        status: formData.status || null,
        source: formData.lead_source || null,
        notes: formData.seller_remark || null,

        seller_dob: null,
        expected_close: null,
        last_activity: nowIso,
        lead_score: null,
        deal_value: null,
        visits: 0,
        total_visits: 0,
        stage_progress: null,
        deal_potential: null,
        response_rate: null,
        avg_response_time: null,

        assigned_to: assignedToId,
        assigned_to_name: assignedToName,
        notifications: null,

        is_active:
          (lead as any)?.is_active != null ? !!(lead as any).is_active : true,
        created_at: nowIso,
        updated_at: nowIso,
        current_stage: formData.stage || null,

        // context only
        lead_id: lead?.id ?? null,
      };

      // === Build "my_property" object (single) ===
      const maxCr = Number(formData.price_max_cr) || 0;
      const maxRs =
        Math.round(
          Number(formData.price_max_rupees) || maxCr * CRORE_TO_RUPEE || 0
        ) || 0;

      const my_property = {
        seller_id: null,
        seller_name: seller.name || null,
        lead_id: String(lead?.id || ""),
        assigned_to: assignedToId,

        property_type_name: formData.property_type || null,
        property_subtype_name: formData.property_subtype || null,
        unit_type: formData.unit_type || null,
        wing: null,
        unit_no: null,
        furnishing: null,
        bedrooms: null,
        bathrooms: null,
        facing: null,
        parking_type: null,
        parking_qty: null,

        city_name: formData.city_name || formData.city || null,
        location_name: formData.location_name || formData.location || null,
        society_name: formData.society_name || null,
        floor: null,
        total_floors: null,

        carpet_area: formData.carpet_area || null,
        builtup_area: null,

        // pricing
        price_max_cr: maxCr,      // legacy
        price_max_rupees: maxRs,  // legacy
        budget: maxRs,            // primary
        final_price: maxRs,       // optional
        address: null,

        status: "new",
        lead_source: formData.lead_source || null,

        possession_month: null,
        possession_year: null,
        purchase_month: null,
        purchase_year: null,
        selling_rights: null,

        ownership_doc_path: null,
        photos: null,
        amenities: null,
        furnishing_items: null,
        description: null,

        created_at: nowIso,
        updated_at: nowIso,
        is_public: 0,
        publication_date: null,
        created_by: (user as any)?.id || null,
        updated_by: (user as any)?.id || null,
        public_views: 0,
        public_inquiries: 0,
        slug: null,
      };

      // === Build "seller_followups" array — parity with buyer payload ===
      // Will include rich fields; backend can ignore columns it doesn't persist.
      const seller_followups = (followups || []).map((f: any) => {
        // schedule resolver (NO accidental fields like assigned_executive)
        const scheduleDT =
          toDate(f?.scheduled_date) ||
          toDate(f?.scheduledDate) ||
          toDate(f?.scheduled_at) ||
          toDate(f?.scheduledAt) ||
          null;

        const completedDT =
          toDate(f?.completed_date) ||
          toDate(f?.completedDate) ||
          toDate(f?.completed_at) ||
          null;

        return {
          // core (existing table compatible)
          followup_id: f?.id ?? null,                       // VARCHAR(36) recommended
          lead_id: lead?.id ?? null,                        // keep UUID/string if DB expects it
          seller_id: null,                                   // server fills post-insert
          followup_type: f?.type || f?.followup_type || "other",
          status: f?.status || null,
          priority: f?.priority || "Medium",
          notes: f?.remark || f?.customRemark || null,      // unify to 'notes'
          assigned_to:
            formData.assigned_executive &&
            String(formData.assigned_executive).trim() !== ""
              ? Number(formData.assigned_executive)
              : (f?.assigned_to ?? f?.assigned_executive ?? null),
          followup_date: toSqlDate(scheduleDT),
          followup_time: toSqlTime(scheduleDT),
          reminder: null,

          // rich parity (if backend supports extra cols it will use them)
          seller_lead_stage: f?.stage ?? null,
          seller_lead_status: f?.status ?? null,
          remark: f?.remark ?? null,
          custom_remark: f?.custom_remark ?? f?.customRemark ?? null,
          next_action: f?.next_action ?? f?.nextAction ?? null,
          completed_date: completedDT ? `${toSqlDate(completedDT)} ${toSqlTime(completedDT)}` : null,

          transferred_from_lead: 1,
          transferred_at: nowIso,
          transferred_by: (user as any)?.id ?? null,
          transfer_type: "lead_transfer",

          created_by: (f?.created_by ?? (user as any)?.id) ?? null,
          updated_by: (f?.updated_by ?? (user as any)?.id) ?? null,
          created_at: f?.created_at ?? nowIso,
          updated_at: f?.updated_at ?? nowIso,
        };
      });

      // === Final payload (debug + API) ===
      const payload = {
        leadId: lead?.id,
        createdBy: (user as any)?.id || null,
        seller,
        my_property,
        seller_followups,
        __debug_source: { formData },
      };

     
      setSubmittedPayload(payload);

      const apiResp = await sellerTransferAPI.transferToSeller(payload);
      

      if (formData.assigned_executive && String(formData.assigned_executive).trim() !== "") {
        try {
          const maybeSellerId =
            apiResp?.seller?.id || apiResp?.seller_id || apiResp?.id;
          const link =
            maybeSellerId != null
              ? `/dashboard/sellers/${encodeURIComponent(maybeSellerId)}`
              : "/dashboard/leads";
          await notifyAssignOrUpdate({
            userId: Number(formData.assigned_executive),
            message: `New seller transferred and assigned to ${
              getAssignedExecName() || "Executive"
            }`,
            type: "seller_transfer",
            link,
          });
        } catch (e) {
          console.error("Transfer notification update failed:", e);
        }
      }

      toast.success("Lead transferred to seller!");
      onTransferSuccess?.(apiResp);
      onClose?.();
    } catch (err: any) {
      console.error("Seller transfer failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to transfer lead to seller.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!isOpen}
      onClose={() => onClose?.()}
      title="Transfer to Seller"
      width="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {/* === READ-ONLY LEAD BASICS === */}
        <div className="space-y-2 p-2">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Salutation
              </label>
              <input
                type="text"
                name="salutation"
                value={formData.salutation}
                readOnly
                className="border border-gray-300 rounded w-full h-8 px-1 text-xs bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                className="border border-gray-300 rounded w-full h-8 px-1 text-xs bg-gray-100 cursor-not-allowed focus:outline-none"
              />
              {errors.name && (
                <div className="text-red-600 text-[11px] mt-1">{errors.name}</div>
              )}
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                readOnly
                className="border border-gray-300 rounded w-full h-8 px-1 text-xs bg-gray-100 cursor-not-allowed focus:outline-none"
              />
              {errors.phone && (
                <div className="text-red-600 text-[11px] mt-1">{errors.phone}</div>
              )}
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium">WhatsApp Number</label>
              <input
                type="text"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium">Lead Source</label>
              <input
                type="text"
                name="lead_source"
                value={formData.lead_source}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Lead Type</label>
              <input
                type="text"
                name="lead_type"
                value={formData.lead_type}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Status</label>
              <input
                type="text"
                name="status"
                value={formData.status}
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Created By</label>
              <input
                type="text"
                name="created_by"
                value={
                  (lead as any)?.created_by_name ||
                  getUserNameById(formData.created_by) ||
                  (formData.created_by ?? "")
                }
                readOnly
                className="w-full border p-1 rounded bg-gray-100 cursor-not-allowed text-xs"
              />
            </div>
          </div>
        </div>

        {/* === EDITABLE SELLER FIELDS === */}
        <div className={wrapperClass}>
          {/* Row 1: property type/subtype + exec */}
          <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium">Property Type</label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className={innerInputClass}
              >
                <option value="">Select Property Type</option>
                {propertyTypeOptions.length > 0 ? (
                  propertyTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot">Plot</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium">Property Subtype</label>
              <select
                name="property_subtype"
                value={formData.property_subtype}
                onChange={handleChange}
                className={innerInputClass}
              >
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
                    <option value="Office">Office</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium">Society Name</label>
              <select
                name="society_name"
                value={formData.society_name}
                onChange={handleChange}
                className={innerInputClass}
              >
                <option value="">Select Society</option>
                {societyNameOptions.length > 0 ? (
                  societyNameOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Society A">Society A</option>
                    <option value="Society B">Society B</option>
                  </>
                )}
              </select>
            </div>

            {/* Sales Executive dropdown */}
            <div>
              <label className="block text-xs font-medium text-green-700">
                Assigned Sales Executive
              </label>
              <div className="relative" ref={execDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowExecDropdown((s) => !s)}
                  className={execButtonClass}
                >
                  <span className="truncate text-xs">{getAssignedExecName()}</span>
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                </button>

                {showExecDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border z-[9999] text-xs">
                    <div className="p-2">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide px-2 py-1 border-b truncate">
                        Assign to Sales Executive
                      </div>

                      {(() => {
                        const availableSalesExecs = getAvailableSalesExecutives();
                        if (!availableSalesExecs?.length) {
                          return (
                            <div className="px-2 py-2 text-xs text-gray-500">
                              No sales executives available
                            </div>
                          );
                        }

                        return (
                          <>
                            <button
                              key="unassigned"
                              type="button"
                              onClick={() => handleExecAssign("")}
                              className={`w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-xs truncate ${
                                !formData.assigned_executive ||
                                formData.assigned_executive === ""
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
                                  String(formData.assigned_executive) ===
                                  String(exec.id)
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-800"
                                }`}
                              >
                                {exec.name}
                                {exec.selfOnly && (
                                  <span className="text-[10px] text-gray-400 ml-1">
                                    (Self)
                                  </span>
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

          {/* Row 2: masters-driven fields */}
          <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium">Unit Type</label>
              <select
                name="unit_type"
                value={formData.unit_type}
                onChange={handleChange}
                className={innerInputClass}
              >
                <option value="">Select Unit Type</option>
                {unitTypeOptions.length > 0 ? (
                  unitTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="Villa">Villa</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium">Location Name</label>
              <select
                name="location_name"
                value={formData.location_name}
                onChange={handleChange}
                className={innerInputClass}
              >
                <option value="">Select Location</option>
                {locationNameOptions.length > 0 ? (
                  locationNameOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Hinjewadi">Hinjewadi</option>
                    <option value="Baner">Baner</option>
                    <option value="Wakad">Wakad</option>
                    <option value="Pune">Pune</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium">City</label>
              <select
                name="city_name"
                value={formData.city_name}
                onChange={handleChange}
                className={innerInputClass}
              >
                <option value="">Select City</option>
                {cityNameOptions.length > 0 ? (
                  cityNameOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium">Carpet Area (sqft)</label>
              <input
                name="carpet_area"
                value={formData.carpet_area}
                onChange={handleChange}
                placeholder="e.g. 750"
                className={innerInputClass}
              />
            </div>
          </div>

          {/* Row X: Asking Price (uses PriceRangeSelector) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-4 gap-2">
            <div className="sm:col-span-2 md:col-span-2">
              <label className="block text-xs font-medium">Asking Price (Max)</label>
              <PriceRangeSelector
                initialMax={Number(formData.price_max_cr) || 0.01}
                max={10} // 10 Cr cap
                onChange={({ min, max, readable }) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    price_min_cr: min,
                    price_max_cr: max,
                    price_max_rupees: Math.round(max * CRORE_TO_RUPEE),
                    price_readable: readable,
                  }));
                }}
                className="mt-1"
              />
            </div>
          </div>

          {/* Row 4: seller remark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium">Seller Remark</label>
              <textarea
                name="seller_remark"
                value={formData.seller_remark}
                onChange={handleChange}
                rows={3}
                placeholder="Add any seller remarks here..."
                className={innerTextareaClass}
              />
            </div>
          </div>
        </div>

        {/* === Debug: What gets submitted === */}
        {submittedPayload ? (
          <div className="mt-2 border rounded p-2 bg-gray-50 text-[11px]">
            <div className="font-semibold mb-1 text-gray-700">Submitted Payload (debug)</div>
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(submittedPayload, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="mt-2 border rounded p-2 bg-gray-50 text-[11px] text-gray-500">
            Click <b>Transfer to Seller</b> to see the exact payload here.
          </div>
        )}

        {/* === Buttons === */}
        <div className="flex justify-end gap-2 mt-1">
          <button
            type="button"
            onClick={() => onClose?.()}
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
                <svg
                  className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Transfer to Seller"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SellerFormModal;
