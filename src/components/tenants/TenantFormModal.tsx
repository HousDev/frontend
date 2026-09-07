import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  X,
  User,
  Mail,
  Upload,
  Building,
  FileText,
  Calendar,
  Plus,
  Edit,
  ChevronDown,
  Search,
  Save,
  Phone,
} from "lucide-react";
import { usersAPI } from "@/lib/api";
import { rentalPropertiesAPI } from "@/lib/rentalPropertiesAPI";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";

interface TenantFormModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  mode: "create" | "edit";
  initialData?: any;
  onSubmit: (data: any) => void | Promise<any>;
  inline?: boolean;
  children?: React.ReactNode;
}

const BRAND = "#e67e22";
const N = "#0f2b3d";
const BG = "#f8fafc";
const BD = "#e2e8f0";

const INP =
  "w-full h-8 px-2.5 rounded-md text-xs border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#e67e22]/20 focus:border-[#e67e22] transition-colors placeholder:text-gray-400";
const LBL =
  "block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1";

/** Convert number -> Indian currency words */
const numberToWords = (numStr: string | number): string => {
  if (!numStr) return "";
  const num = Number(numStr);
  if (isNaN(num) || num <= 0) return "";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const makeWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + makeWords(n % 100) : "")
      );
    return "";
  };

  let str = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num / 100000) % 100);
  const thousand = Math.floor((num / 1000) % 100);
  const hundred = Math.floor((num / 100) % 10);
  const rest = num % 100;

  if (crore) str += makeWords(crore) + " Crore ";
  if (lakh) str += makeWords(lakh) + " Lakh ";
  if (thousand) str += makeWords(thousand) + " Thousand ";
  if (hundred) str += makeWords(hundred) + " Hundred ";
  if (rest) str += makeWords(rest);

  return str.trim() ? `${str.trim()} Rupees` : "";
};

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="flex items-center gap-2 mb-3 mt-4">
    <div
      className="w-1 h-3.5 rounded-full flex-shrink-0"
      style={{ background: BRAND }}
    />
    <span
      className="text-[10px] font-black uppercase tracking-widest"
      style={{ color: BRAND }}
    >
      {children}
    </span>
    <div className="flex-1 h-px bg-orange-100" />
  </div>
);

const Field: React.FC<{
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className={LBL}>
      {label}
      {required && <span className="text-red-400 ml-0.5 normal-case">*</span>}
    </label>
    {children}
  </div>
);

const formatWhatsappValue = (phone: string) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91")) {
    return `+91 ${digits.slice(2)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits}`;
  }
  return phone.startsWith("+") ? phone : `+${digits}`;
};

export const TenantFormModal: React.FC<TenantFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  inline = false,
  children,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    profile_image: "",
    email: "",
    phone: "",
    whatsapp: "",
    preferred_location: "",
    budget_min: "",
    budget_max: "",
    preferred_bhk: "",
    tenant_type: "",
    move_in_date: "",
    current_address: "",
    notes: "",
    status: "Active Search",
    rental_property_id: "",
    assigned_to: "",
  });

  const [executives, setExecutives] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [bhkOptions, setBhkOptions] = useState<MasterOption[]>([
    { value: "1 BHK", label: "1 BHK" },
    { value: "2 BHK", label: "2 BHK" },
    { value: "3 BHK", label: "3 BHK" },
    { value: "4 BHK", label: "4 BHK" },
  ]);
  const [locationOptions, setLocationOptions] = useState<MasterOption[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedBhk, setSelectedBhk] = useState<string[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");
  const [isPropDropdownOpen, setIsPropDropdownOpen] = useState(false);
  const [sameWhatsapp, setSameWhatsapp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetErrors, setBudgetErrors] = useState<{
    min?: string;
    max?: string;
  }>({});

  const propContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shouldInit = inline || isOpen;
    if (shouldInit) {
      if (mode === "edit" && initialData) {
        setFormData({
          first_name: initialData.first_name || "",
          last_name: initialData.last_name || "",
          profile_image: initialData.profile_image || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          whatsapp: initialData.whatsapp || "",
          preferred_location: initialData.preferred_location || "",
          budget_min: initialData.budget_min || "",
          budget_max: initialData.budget_max || "",
          preferred_bhk: initialData.preferred_bhk || "",
          tenant_type: initialData.tenant_type || "",
          move_in_date: initialData.move_in_date
            ? initialData.move_in_date.split("T")[0]
            : "",
          current_address: initialData.current_address || "",
          notes: initialData.notes || "",
          status: initialData.status || "Active Search",
          rental_property_id: initialData.rental_property_id || "",
          assigned_to: initialData.assigned_to || "",
        });

        const initialLocs = initialData.preferred_location
          ? initialData.preferred_location
              .split(/[;,]+/)
              .map((s: any) => s.trim())
              .filter(Boolean)
          : [];
        setSelectedLocations(initialLocs);

        const initialBhks = initialData.preferred_bhk
          ? initialData.preferred_bhk
              .split(/[;,]+/)
              .map((s: any) => s.trim())
              .filter(Boolean)
          : [];
        setSelectedBhk(initialBhks);

        let propTitle = initialData.property_title || "";
        if (!propTitle && initialData.rental_property_id) {
          propTitle = `RENT-${initialData.rental_property_id}`;
        }
        setPropertySearch(propTitle);

        const phoneDigits = String(initialData.phone || "").replace(/\D/g, "");
        const waDigits = String(initialData.whatsapp || "").replace(/\D/g, "");
        setSameWhatsapp(
          !!waDigits && phoneDigits.slice(-10) === waDigits.slice(-10),
        );
      } else {
        setFormData({
          first_name: "",
          last_name: "",
          profile_image: "",
          email: "",
          phone: "",
          whatsapp: "",
          preferred_location: "",
          budget_min: "",
          budget_max: "",
          preferred_bhk: "",
          tenant_type: "",
          move_in_date: "",
          current_address: "",
          notes: "",
          status: "Active Search",
          rental_property_id: "",
          assigned_to: "",
        });
        setSelectedLocations([]);
        setSelectedBhk([]);
        setPropertySearch("");
        setSameWhatsapp(false);
      }
    }
  }, [isOpen, inline, mode, initialData]);

  useEffect(() => {
    if (!inline && !isOpen) return;
    const fetchMetadata = async () => {
      try {
        setLoadingMetadata(true);
        const [usersRes, propsRes, masterData] = await Promise.all([
          usersAPI.getAllUsers().catch(() => ({ success: false, data: [] })),
          rentalPropertiesAPI
            .getProperties()
            .catch(() => ({ success: false, data: [] })),
          getMasterDropdownOptions(["common", "property", "location"]).catch(
            () => ({}),
          ),
        ]);

        if (usersRes.success && Array.isArray(usersRes.data)) {
          const execs = usersRes.data.filter(
            (u: any) =>
              u.role === "sales_executive" ||
              u.role_name === "sales_executive" ||
              u.role_name === "admin",
          );
          setExecutives(execs);
        }

        const rawProps =
          propsRes.success && Array.isArray(propsRes.data)
            ? propsRes.data
            : Array.isArray(propsRes)
              ? propsRes
              : [];
        setProperties(rawProps);

        const bhkOpts = masterData["unit type"] ||
          masterData["preferred_bhk"] || [
            { value: "1 BHK", label: "1 BHK" },
            { value: "2 BHK", label: "2 BHK" },
            { value: "3 BHK", label: "3 BHK" },
            { value: "4 BHK", label: "4 BHK" },
          ];
        setBhkOptions(bhkOpts);

        const locOpts = masterData["location"] || masterData["locations"] || [];
        setLocationOptions(locOpts);
      } catch (err) {
        console.error("Failed to load form metadata:", err);
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, [isOpen, inline]);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (
        propContainerRef.current &&
        !propContainerRef.current.contains(e.target as Node)
      ) {
        setIsPropDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const filteredProperties = useMemo(() => {
    let result = properties;

    if (formData.budget_min) {
      const minB = Number(formData.budget_min);
      if (!isNaN(minB) && minB > 0) {
        result = result.filter((p: any) => {
          const rent = Number(p.monthly_rent || p.budget || p.final_price || 0);
          return rent >= minB;
        });
      }
    }

    if (formData.budget_max) {
      const maxB = Number(formData.budget_max);
      if (!isNaN(maxB) && maxB > 0) {
        result = result.filter((p: any) => {
          const rent = Number(p.monthly_rent || p.budget || p.final_price || 0);
          return rent <= maxB;
        });
      }
    }

    if (formData.preferred_bhk) {
      const bhkVal = String(formData.preferred_bhk).toLowerCase().trim();
      const bhkDigit = bhkVal.replace(/\D/g, "");
      result = result.filter((p: any) => {
        const pBhk = String(p.bedrooms || p.unit_type || p.unitType || "")
          .toLowerCase()
          .trim();
        const pBhkDigit = pBhk.replace(/\D/g, "");
        if (bhkDigit && pBhkDigit) {
          return pBhkDigit === bhkDigit;
        }
        return pBhk.includes(bhkVal);
      });
    }

    if (formData.preferred_location) {
      const locVal = String(formData.preferred_location).toLowerCase().trim();
      result = result.filter((p: any) => {
        const address = String(p.address || "").toLowerCase();
        const location = String(
          p.location_name || p.location || "",
        ).toLowerCase();
        const society = String(p.society_name || p.society || "").toLowerCase();
        const city = String(p.city_name || p.city || "").toLowerCase();
        return (
          address.includes(locVal) ||
          location.includes(locVal) ||
          society.includes(locVal) ||
          city.includes(locVal)
        );
      });
    }

    const q = propertySearch.toLowerCase().trim();
    if (q && q !== "unlinked") {
      result = result.filter((p: any) => {
        const title = String(
          p.title || p.property_type_name || p.society_name || "",
        ).toLowerCase();
        const code = `rent-${p.id}`.toLowerCase();
        const location = String(
          p.location_name || p.society_name || "",
        ).toLowerCase();
        return title.includes(q) || code.includes(q) || location.includes(q);
      });
    }

    return result;
  }, [
    properties,
    propertySearch,
    formData.budget_min,
    formData.budget_max,
    formData.preferred_bhk,
    formData.preferred_location,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => {
      const formattedPhone = value.startsWith("+") ? value : `+${value}`;
      const updated = { ...prev, phone: formattedPhone };
      if (sameWhatsapp) {
        updated.whatsapp = formatWhatsappValue(formattedPhone);
      }
      return updated;
    });
  };

  const handleWhatsappChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      whatsapp: value.startsWith("+") ? value : `+${value}`,
    }));
  };

  const toggleSameWhatsapp = () => {
    setSameWhatsapp((prev) => {
      const next = !prev;
      if (next && formData.phone) {
        setFormData((p) => ({ ...p, whatsapp: formatWhatsappValue(p.phone) }));
      }
      return next;
    });
  };

  const togglePreferredLocation = (val: string) => {
    setSelectedLocations((prev) => {
      const next = prev.includes(val)
        ? prev.filter((item) => item !== val)
        : [...prev, val];
      setFormData((fd) => ({ ...fd, preferred_location: next.join(", ") }));
      return next;
    });
  };

  const togglePreferredBhk = (val: string) => {
    setSelectedBhk((prev) => {
      const next = prev.includes(val)
        ? prev.filter((item) => item !== val)
        : [...prev, val];
      setFormData((fd) => ({ ...fd, preferred_bhk: next.join(", ") }));
      return next;
    });
  };

  const handleBudgetBlur = (field: "min" | "max") => {
    const val = Number(
      field === "min" ? formData.budget_min : formData.budget_max,
    );
    if (val > 0 && val < 1000) {
      setBudgetErrors((prev) => ({
        ...prev,
        [field]: "Amount cannot be less than ₹1,000",
      }));
    } else {
      setBudgetErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.first_name || !formData.phone) {
      toast.error("Name and Phone fields are required.");
      return;
    }
    const minB = Number(formData.budget_min || 0);
    const maxB = Number(formData.budget_max || 0);
    if (
      (formData.budget_min && minB > 0 && minB < 1000) ||
      (formData.budget_max && maxB > 0 && maxB < 1000)
    ) {
      toast.error("Budget amount cannot be less than ₹1,000.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!inline && !isOpen) return null;

  const renderHeader = () => {
    if (inline) {
      return (
        <div className="px-4 py-3 bg-[#0f2b3d] flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-bold">
              Tenant Profile & Preferences
            </span>
          </div>
        </div>
      );
    }
    return (
      <div className="px-4 py-3 bg-[#0f2b3d] flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          {mode === "edit" ? (
            <Edit size={16} className="text-[#e67e22]" />
          ) : (
            <Plus size={16} className="text-[#e67e22]" />
          )}
          <span className="text-sm font-bold">
            {mode === "edit" ? "Edit Tenant Profile" : "Add Tenant Profile"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  const formContainerClass = inline
    ? "p-4 space-y-3.5 bg-white rounded-b-xl border border-t-0 border-slate-200"
    : "flex-1 overflow-y-auto p-4 space-y-3.5";
  const formContainerStyle = inline
    ? undefined
    : { scrollbarWidth: "thin" as const };

  return (
    <>
      {inline ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {renderHeader()}
          <div className={formContainerClass} style={formContainerStyle}>
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {children}
              <FormContent
                formData={formData}
                handleInputChange={handleInputChange}
                handlePhoneChange={handlePhoneChange}
                handleProfileImageChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                ) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    setFormData((prev: any) => ({
                      ...prev,
                      profile_image: String(reader.result || ""),
                    }));
                  reader.readAsDataURL(file);
                }}
                handleWhatsappChange={handleWhatsappChange}
                sameWhatsapp={sameWhatsapp}
                toggleSameWhatsapp={toggleSameWhatsapp}
                bhkOptions={bhkOptions}
                selectedBhk={selectedBhk}
                togglePreferredBhk={togglePreferredBhk}
                locationOptions={locationOptions}
                selectedLocations={selectedLocations}
                togglePreferredLocation={togglePreferredLocation}
                budgetErrors={budgetErrors}
                handleBudgetBlur={handleBudgetBlur}
                propContainerRef={propContainerRef}
                propertySearch={propertySearch}
                setPropertySearch={setPropertySearch}
                isPropDropdownOpen={isPropDropdownOpen}
                setIsPropDropdownOpen={setIsPropDropdownOpen}
                filteredProperties={filteredProperties}
                setFormData={setFormData}
                setBudgetErrors={setBudgetErrors}
                executives={executives}
                isSubmitting={isSubmitting}
                mode={mode}
                inline={inline}
                onClose={onClose}
              />
            </form>
          </div>
        </div>
      ) : (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {renderHeader()}
            <form
              onSubmit={handleFormSubmit}
              className="flex-1 overflow-y-auto p-4 space-y-3.5"
              style={{ scrollbarWidth: "thin" }}
            >
              {children}
              <FormContent
                formData={formData}
                handleInputChange={handleInputChange}
                handlePhoneChange={handlePhoneChange}
                handleProfileImageChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                ) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    setFormData((prev: any) => ({
                      ...prev,
                      profile_image: String(reader.result || ""),
                    }));
                  reader.readAsDataURL(file);
                }}
                handleWhatsappChange={handleWhatsappChange}
                sameWhatsapp={sameWhatsapp}
                toggleSameWhatsapp={toggleSameWhatsapp}
                bhkOptions={bhkOptions}
                selectedBhk={selectedBhk}
                togglePreferredBhk={togglePreferredBhk}
                locationOptions={locationOptions}
                selectedLocations={selectedLocations}
                togglePreferredLocation={togglePreferredLocation}
                budgetErrors={budgetErrors}
                handleBudgetBlur={handleBudgetBlur}
                propContainerRef={propContainerRef}
                propertySearch={propertySearch}
                setPropertySearch={setPropertySearch}
                isPropDropdownOpen={isPropDropdownOpen}
                setIsPropDropdownOpen={setIsPropDropdownOpen}
                filteredProperties={filteredProperties}
                setFormData={setFormData}
                setBudgetErrors={setBudgetErrors}
                executives={executives}
                isSubmitting={isSubmitting}
                mode={mode}
                inline={inline}
                onClose={onClose}
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Extracted Form Content Component
const FormContent: React.FC<any> = ({
  formData,
  handleInputChange,
  handlePhoneChange,
  handleProfileImageChange,
  handleWhatsappChange,
  sameWhatsapp,
  toggleSameWhatsapp,
  bhkOptions,
  selectedBhk,
  togglePreferredBhk,
  locationOptions,
  selectedLocations,
  togglePreferredLocation,
  budgetErrors,
  handleBudgetBlur,
  propContainerRef,
  propertySearch,
  setPropertySearch,
  isPropDropdownOpen,
  setIsPropDropdownOpen,
  filteredProperties,
  setFormData,
  setBudgetErrors,
  executives,
  isSubmitting,
  mode,
  inline,
  onClose,
}) => {
  return (
    <>
      {/* Section 1: Profile Photo */}
      <SectionHeader>Profile Photo</SectionHeader>
      <div className="flex items-center gap-3">
        {formData.profile_image ? (
          <img
            src={formData.profile_image}
            alt="Tenant profile"
            className="h-14 w-14 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
            {(formData.first_name || "T").charAt(0).toUpperCase()}
            {(formData.last_name || "").charAt(0).toUpperCase()}
          </div>
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Upload size={14} />
          Upload Profile Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Section 1: Contact Information */}
      <SectionHeader>Contact Information</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" required>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className={INP}
            placeholder="Enter first name"
            required
          />
        </Field>

        <Field label="Last Name">
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className={INP}
            placeholder="Enter last name"
          />
        </Field>

        <Field label="Email Address">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={INP}
            placeholder="client@example.com"
          />
        </Field>

        <Field label="Phone Number" required>
          <PhoneInput
            country="in"
            enableSearch={true}
            value={formData.phone || ""}
            onChange={(val) => handlePhoneChange(val)}
            inputProps={{ name: "phone", required: true }}
            inputClass="!w-full !h-8 !text-xs !rounded-md !pl-12 !border !border-gray-200"
            containerClass="!w-full h-8"
            buttonClass="!rounded-l-md"
          />
        </Field>

        <Field
          label={
            <div className="flex items-center justify-between w-full">
              <span>WhatsApp Number</span>
              <label className="inline-flex items-center cursor-pointer gap-1 normal-case font-semibold text-[8px] text-gray-500">
                <input
                  type="checkbox"
                  checked={sameWhatsapp}
                  onChange={toggleSameWhatsapp}
                  className="accent-orange-500 h-3 w-3 cursor-pointer"
                />
                <span>Same as Phone</span>
              </label>
            </div>
          }
        >
          <PhoneInput
            country="in"
            enableSearch={true}
            value={formData.whatsapp || ""}
            onChange={(val) => handleWhatsappChange(val)}
            disabled={sameWhatsapp}
            inputProps={{ name: "whatsapp" }}
            inputClass={`!w-full !h-8 !text-xs !rounded-md !pl-12 !border !border-gray-200 ${sameWhatsapp ? "bg-gray-100 cursor-not-allowed" : ""}`}
            containerClass="!w-full h-8"
            buttonClass="!rounded-l-md"
          />
        </Field>
      </div>

      {/* Section 2: Requirements */}
      <SectionHeader>Requirements & Context</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tenant Type">
          <select
            name="tenant_type"
            value={formData.tenant_type}
            onChange={handleInputChange}
            className={INP}
          >
            <option value="">Select Type</option>
            <option value="Family">Family</option>
            <option value="Bachelor (Male)">Bachelor (Male)</option>
            <option value="Bachelor (Female)">Bachelor (Female)</option>
            <option value="Company">Company</option>
          </select>
        </Field>

        <div className="flex flex-col gap-0.5">
          <MultiSelectDropdown
            label="Preferred BHK"
            options={bhkOptions}
            selectedValues={selectedBhk}
            onToggle={togglePreferredBhk}
            placeholder="Select BHK"
          />
        </div>

        <Field label="Min Budget (₹)">
          <input
            type="text"
            name="budget_min"
            value={formData.budget_min}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setFormData((prev: any) => ({ ...prev, budget_min: val }));
              if (Number(val) >= 1000 || val === "")
                setBudgetErrors((prev: any) => ({ ...prev, min: undefined }));
            }}
            onBlur={() => handleBudgetBlur("min")}
            className={`${INP} ${budgetErrors.min ? "border-red-500" : ""}`}
            placeholder="e.g. 5000"
          />
          {budgetErrors.min ? (
            <p className="text-[10px] text-red-500 font-medium mt-1">
              {budgetErrors.min}
            </p>
          ) : (
            formData.budget_min &&
            Number(formData.budget_min) > 0 && (
              <p className="text-[10px] text-green-600 font-medium mt-1">
                {numberToWords(formData.budget_min)}
              </p>
            )
          )}
        </Field>

        <Field label="Max Budget (₹)">
          <input
            type="text"
            name="budget_max"
            value={formData.budget_max}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setFormData((prev: any) => ({ ...prev, budget_max: val }));
              if (Number(val) >= 1000 || val === "")
                setBudgetErrors((prev: any) => ({ ...prev, max: undefined }));
            }}
            onBlur={() => handleBudgetBlur("max")}
            className={`${INP} ${budgetErrors.max ? "border-red-500" : ""}`}
            placeholder="e.g. 8000"
          />
          {budgetErrors.max ? (
            <p className="text-[10px] text-red-500 font-medium mt-1">
              {budgetErrors.max}
            </p>
          ) : (
            formData.budget_max &&
            Number(formData.budget_max) > 0 && (
              <p className="text-[10px] text-green-600 font-medium mt-1">
                {numberToWords(formData.budget_max)}
              </p>
            )
          )}
        </Field>

        <div className="flex flex-col gap-0.5">
          <MultiSelectDropdown
            label="Preferred Location"
            options={locationOptions}
            selectedValues={selectedLocations}
            onToggle={togglePreferredLocation}
            placeholder="Select locations"
            withSearch
          />
        </div>

        <Field label="Target Move-In Date">
          <input
            type="date"
            name="move_in_date"
            value={formData.move_in_date}
            onChange={handleInputChange}
            className={INP}
          />
        </Field>
      </div>

      {/* Section 3: Linkings & Allocation */}
      <SectionHeader>Properties & Execution</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        {/* Link Property Input (Dropdown selector) */}
        <div ref={propContainerRef} className="relative flex flex-col gap-0.5">
          <label className={LBL}>Link Rental Property</label>
          <input
            type="text"
            value={propertySearch}
            onFocus={() => setIsPropDropdownOpen(true)}
            onChange={(e) => {
              setPropertySearch(e.target.value);
              setIsPropDropdownOpen(true);
            }}
            placeholder="Search or Select Property..."
            className={INP}
          />
          {isPropDropdownOpen && (
            <div className="absolute top-12 left-0 right-0 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-[11px] divide-y">
              <div
                onClick={() => {
                  setFormData((prev: any) => ({
                    ...prev,
                    rental_property_id: "",
                  }));
                  setPropertySearch("Unlinked");
                  setIsPropDropdownOpen(false);
                }}
                className="p-2 cursor-pointer hover:bg-gray-50 text-gray-500 font-bold"
              >
                Unlinked / Remove Link
              </div>
              {filteredProperties.length === 0 ? (
                <div className="p-2 text-center text-gray-400 italic">
                  No matching properties found
                </div>
              ) : (
                filteredProperties.map((p: any) => {
                  const dynamicTitle =
                    p.title ||
                    `${p.property_type_name || ""} ${p.unit_type || ""} at ${p.society_name || ""}`.trim() ||
                    "Rental Property";
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setFormData((prev: any) => ({
                          ...prev,
                          rental_property_id: String(p.id),
                        }));
                        setPropertySearch(dynamicTitle);
                        setIsPropDropdownOpen(false);
                      }}
                      className="p-2 cursor-pointer hover:bg-gray-50 text-gray-800"
                    >
                      <div className="font-semibold">{dynamicTitle}</div>
                      <div className="text-[9px] text-gray-400">
                        RENT-{p.id} • {p.society_name || p.location_name || "-"}{" "}
                        • ₹{p.monthly_rent || "0"}/mo
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <Field label="Assigned Executive">
          <select
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleInputChange}
            className={INP}
          >
            <option value="">Unassigned</option>
            {executives.map((u) => (
              <option key={u.id} value={u.id}>
                {u.salutation ? `${u.salutation} ` : ""}
                {u.first_name} {u.last_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={INP}
          >
            <option value="Active Search">Active Search</option>
            <option value="Interested">Interested</option>
            <option value="Agreement Signed">Agreement Signed</option>
            <option value="Inactive">Inactive</option>
          </select>
        </Field>

        <Field label="Current Address" className="col-span-2">
          <input
            type="text"
            name="current_address"
            value={formData.current_address}
            onChange={handleInputChange}
            className={INP}
            placeholder="Renter's current residence address"
          />
        </Field>

        <Field label="General Remarks / Notes" className="col-span-2">
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 rounded-md text-xs border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#e67e22]/20 focus:border-[#e67e22] transition-colors placeholder:text-gray-400"
            placeholder="Add general remarks, special preferences, follow-up logs..."
          />
        </Field>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
        {!inline && (
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-100 font-bold text-xs"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-1.5 rounded-lg text-white bg-[#e67e22] hover:bg-[#d35400] font-bold shadow-sm text-xs disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? mode === "edit"
              ? "Updating..."
              : "Saving..."
            : mode === "edit"
              ? "Update Profile"
              : "Save Profile"}
        </button>
      </div>
    </>
  );
};

// MultiSelectDropdown helper component
const MultiSelectDropdown = ({
  label,
  options,
  selectedValues = [],
  onToggle,
  placeholder,
  withSearch = false,
}: {
  label: string;
  options: any[];
  selectedValues?: any[];
  onToggle: (val: any) => void;
  placeholder: string;
  withSearch?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const safeOptions = Array.isArray(options) ? options : [];

  const filteredOptions = useMemo(() => {
    if (!withSearch || !searchTerm) return safeOptions;
    const t = searchTerm.toLowerCase();
    return safeOptions.filter((o) => o?.label?.toLowerCase().includes(t));
  }, [withSearch, searchTerm, safeOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
      if (event.key === "Tab" && isOpen) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && withSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, withSearch]);

  const handleToggle = (val: any) => {
    onToggle(val);
  };

  const MU = "#5a7184";
  const N = "#0f2b3d";

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </label>
      <button
        type="button"
        className="border rounded-md w-full h-8 px-2.5 text-xs text-left focus:outline-none focus:ring-2 focus:ring-[#e67e22]/20 focus:border-[#e67e22] transition-colors flex items-center justify-between bg-white border-gray-200"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSearchTerm("");
        }}
      >
        <span
          className="truncate"
          style={{ color: selectedValues.length > 0 ? N : MU }}
        >
          {selectedValues.length > 0
            ? selectedValues.slice(0, 2).join(", ") +
              (selectedValues.length > 2
                ? ` +${selectedValues.length - 2}`
                : "")
            : placeholder}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: MU }}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-hidden border-gray-200">
          {withSearch && (
            <div className="p-1.5 border-b sticky top-0 bg-white z-10 border-gray-200">
              <div className="relative">
                <Search
                  size={10}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-[10px] border rounded-md focus:outline-none focus:ring-1 border-gray-200"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-32">
            {filteredOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center p-1.5 hover:bg-gray-50 cursor-pointer gap-2 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleToggle(option.value)}
                  className="h-3 w-3 rounded text-[#e67e22]"
                  style={{ accentColor: "#e67e22" }}
                />
                <span className="text-[10px]" style={{ color: N }}>
                  {option.label}
                </span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-2 text-[10px] text-center text-gray-400">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantFormModal;