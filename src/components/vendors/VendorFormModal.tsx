import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  Check,
  Crown,
  Award,
  Phone,
  Shield,
  Calendar,
  Briefcase,
  Tag,
  AlertCircle,
  Building2,
  Languages,
  BadgeCheck,
  Wrench,
  PaintRoller,
  Hammer,
  Palette,
  Droplets,
  Plug,
  User,
  Layers,
  ChevronDown,
  MapPin,
  Clock,
  Star,
} from "lucide-react";
import VendorMasterSelect from "./VendorMasterSelect";
import {
  VENDOR_MASTER_TYPES,
  getMasterOptions,
  getVendorMasterCatalog,
  persistMasterOption,
  type VendorMasterCatalog,
} from "@/lib/vendorMaster";
import type { MasterOption } from "@/lib/useMasterData";

const NAME_ALLOWED = /[^A-Za-z\s.'-]/g;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const stripToLetters = (value: string) =>
  value.replace(NAME_ALLOWED, "").replace(/\s{2,}/g, " ");
const stripToDigits = (value: string, max = 10) =>
  value.replace(/\D/g, "").slice(0, max);

const validators = {
  name: (v: string) =>
    !v.trim()
      ? "Contact name is required"
      : v.trim().length < 2
        ? "Enter the full name"
        : "",
  businessName: (v: string) => (!v.trim() ? "Business name is required" : ""),
  phone: (v: string) =>
    !v.trim()
      ? "Phone number is required"
      : v.length !== 10
        ? "Enter a valid 10-digit number"
        : "",
  email: (v: string) =>
    !v.trim()
      ? "Email address is required"
      : !EMAIL_PATTERN.test(v.trim())
        ? "Enter a valid email address"
        : "",
};

const Field = ({
  label,
  required = false,
  error,
  children,
  className = "",
}: any) => (
  <div className={className}>
    <div className="flex items-baseline justify-between mb-1">
      <label className="text-[10px] font-medium text-[#5B564C] tracking-wide">
        {label} {required && <span className="text-[#B3413E]">*</span>}
      </label>
      {error && (
        <span className="text-[9px] text-[#B3413E] font-medium">{error}</span>
      )}
    </div>
    {children}
  </div>
);

const inputBase =
  "w-full px-3 py-1.5 bg-white border rounded-lg text-[12px] text-[#0E3658] placeholder:text-[#B4AC9E] transition-all duration-200 focus:outline-none focus:ring-2";
const inputOk =
  "border-[#E3DECF] focus:border-[#A97142] focus:ring-[#A97142]/20 hover:border-[#A97142]/50";
const inputBad =
  "border-[#D8A4A0] focus:border-[#B3413E] focus:ring-[#B3413E]/20";
const inputClass = (hasError: boolean) =>
  `${inputBase} ${hasError ? inputBad : inputOk}`;

const SectionHeading = ({ index, title, icon: Icon }: any) => (
  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#E3DECF]">
    <span className="font-serif text-[10px] text-[#A97142] font-semibold tracking-wider">
      {index}
    </span>
    <div className="h-4 w-px bg-[#E3DECF]" />
    <Icon className="w-3 h-3 text-[#A97142]" strokeWidth={1.75} />
    <h3 className="text-[11px] font-semibold text-[#0E3658] tracking-wide">
      {title}
    </h3>
  </div>
);

const categoryIconFor = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes("plumb")) return Wrench;
  if (key.includes("tile") || key.includes("floor")) return Layers;
  if (key.includes("paint")) return PaintRoller;
  if (key.includes("carpent")) return Hammer;
  if (key.includes("interior")) return Palette;
  if (key.includes("water")) return Droplets;
  if (key.includes("electric")) return Plug;
  return Wrench;
};

const emptyForm = {
  salutation: "",
  name: "",
  businessName: "",
  category: "",
  countryCode: "+91",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  rating: 4.5,
  experience: 1,
  verified: false,
  reExpertVerified: false,
  reSuggested: false,
  services: [] as any[],
  tags: [] as string[],
  rateIdea: "",
  description: "",
  availability: {
    days: [] as string[],
    startTime: "09:00",
    endTime: "18:00",
    weeklyOff: "",
  },
  languages: [] as string[],
  certifications: [] as string[],
  completedProjects: 0,
  responseTime: "",
  status: "",
};

// Enhanced Multiselect component with +N functionality
const MultiSelect = ({
  options,
  selectedValues,
  onChange,
  placeholder,
  onAdd,
  addPlaceholder,
}: {
  options: MasterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  onAdd?: (value: string) => void;
  addPlaceholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleAdd = () => {
    if (newValue.trim() && onAdd) {
      onAdd(newValue.trim());
      setNewValue("");
      setIsAdding(false);
    }
  };

  const displayLabels = selectedValues.map(
    (val) => options.find((opt) => opt.value === val)?.label || val,
  );
  const showPlus = displayLabels.length > 3;
  const visibleLabels = displayLabels.slice(0, 3);
  const remainingCount = displayLabels.length - 3;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`${inputBase} cursor-pointer flex items-center justify-between min-h-[32px] py-0.5`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1 min-w-0 flex-1 flex-wrap">
          {selectedValues.length === 0 ? (
            <span className="text-[#B4AC9E] text-[10px]">{placeholder}</span>
          ) : (
            <>
              {visibleLabels.map((label, idx) => (
                <span
                  key={idx}
                  className="text-[#0E3658] text-[9px] bg-[#FBF9F5] px-1.5 py-0.5 rounded-md border border-[#E3DECF]"
                >
                  {label}
                </span>
              ))}
              {showPlus && (
                <span
                  className="text-[9px] text-[#A97142] font-medium cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                  }}
                >
                  +{remainingCount}
                </span>
              )}
            </>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-[#8A8375] transition-transform duration-200 ml-1 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E3DECF] rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-white p-1.5 border-b border-[#E3DECF]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 text-[10px] border border-[#E3DECF] rounded-md focus:outline-none focus:border-[#A97142]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {selectedValues.length > 0 && (
            <div className="px-2 py-0.5 bg-[#FBF9F5] border-b border-[#E3DECF] text-[9px] text-[#8A8375]">
              {selectedValues.length} selected
            </div>
          )}

          <div className="max-h-32 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer hover:bg-[#FBF9F5] transition-colors ${
                  selectedValues.includes(option.value) ? "bg-[#FBF9F5]" : ""
                }`}
                onClick={() => handleToggle(option.value)}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => {}}
                  className="w-3 h-3 rounded border-[#E3DECF] text-[#0E3658] focus:ring-[#A97142]"
                />
                <span className="text-[10px] text-[#3B3730]">
                  {option.label}
                </span>
              </div>
            ))}

            {filteredOptions.length === 0 && searchTerm && onAdd && (
              <div
                className="px-2 py-1 text-[10px] text-[#A97142] cursor-pointer hover:bg-[#FBF9F5] flex items-center gap-1 border-t border-[#E3DECF]"
                onClick={() => {
                  setIsAdding(true);
                  setIsOpen(false);
                }}
              >
                <Plus size={10} />
                Add "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}

      {isAdding && onAdd && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 shadow-xl max-w-sm w-full">
            <h4 className="text-[13px] font-semibold text-[#0E3658] mb-2">
              Add New
            </h4>
            <input
              autoFocus
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={addPlaceholder || "Enter value"}
              className="w-full px-3 py-1.5 border border-[#E3DECF] rounded-lg text-[11px] focus:outline-none focus:border-[#A97142]"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-[10px] text-[#5B564C] hover:bg-[#FBF9F5] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1 bg-[#0E3658] text-white rounded-lg text-[10px] hover:bg-[#1a4a7a] transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VendorFormModal = ({ isOpen, onClose, vendor, onSave }: any) => {
  const [formData, setFormData] = useState<any>(emptyForm);
  const [catalog, setCatalog] = useState<VendorMasterCatalog>({});
  const [newService, setNewService] = useState({
    name: "",
    rate: "",
    unit: "",
    description: "",
  });
  const [newTag, setNewTag] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newDay, setNewDay] = useState("");
  const [addingDay, setAddingDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const salutations = getMasterOptions(catalog, VENDOR_MASTER_TYPES.salutation);
  const statuses = getMasterOptions(catalog, VENDOR_MASTER_TYPES.status);
  const categories = getMasterOptions(catalog, VENDOR_MASTER_TYPES.category);
  const countryCodes = getMasterOptions(
    catalog,
    VENDOR_MASTER_TYPES.countryCode,
  );
  const responseTimes = getMasterOptions(
    catalog,
    VENDOR_MASTER_TYPES.responseTime,
  );
  const serviceUnits = getMasterOptions(
    catalog,
    VENDOR_MASTER_TYPES.serviceUnit,
  );
  const tagOptions = getMasterOptions(catalog, VENDOR_MASTER_TYPES.tags);
  const serviceOptions = getMasterOptions(
    catalog,
    VENDOR_MASTER_TYPES.services,
  );
  const languageOptions = getMasterOptions(
    catalog,
    VENDOR_MASTER_TYPES.languages,
  );
  const certificationOptions = getMasterOptions(
    catalog,
    VENDOR_MASTER_TYPES.certifications,
  );
  const weekDays = getMasterOptions(catalog, VENDOR_MASTER_TYPES.weekDays);

  const applyDefaults = (nextCatalog: VendorMasterCatalog, current: any) => {
    const pick = (canonical: string, existing: string) => {
      if (existing) return existing;
      return getMasterOptions(nextCatalog, canonical)[0]?.value || "";
    };
    return {
      ...current,
      salutation: pick(VENDOR_MASTER_TYPES.salutation, current.salutation),
      status: pick(VENDOR_MASTER_TYPES.status, current.status),
      category: pick(VENDOR_MASTER_TYPES.category, current.category),
      countryCode:
        current.countryCode ||
        getMasterOptions(nextCatalog, VENDOR_MASTER_TYPES.countryCode).find(
          (c) => c.value === "+91",
        )?.value ||
        "+91",
      responseTime: pick(
        VENDOR_MASTER_TYPES.responseTime,
        current.responseTime,
      ),
      availability: {
        ...current.availability,
        weeklyOff:
          current.availability?.weeklyOff ||
          getMasterOptions(nextCatalog, VENDOR_MASTER_TYPES.weekDays)[0]
            ?.value ||
          "",
        days: current.availability?.days?.length
          ? current.availability.days
          : getMasterOptions(nextCatalog, VENDOR_MASTER_TYPES.weekDays).map(
              (d) => d.value,
            ),
      },
    };
  };

  const loadCatalog = async () => {
    const data = await getVendorMasterCatalog();
    setCatalog(data);
    setFormData((prev: any) => applyDefaults(data, prev));
    setNewService((prev) => ({
      ...prev,
      unit:
        prev.unit ||
        getMasterOptions(data, VENDOR_MASTER_TYPES.serviceUnit)[0]?.value ||
        "",
    }));
    return data;
  };

  useEffect(() => {
    if (!isOpen) return;
    setAttemptedSubmit(false);
    setTouched({});
    setAddingCategory(false);
    setNewCategory("");
    loadCatalog().catch((error) =>
      console.error("Failed to load Common Master:", error),
    );
  }, [isOpen]);

  useEffect(() => {
    if (vendor) {
      setFormData((prev: any) => ({
        ...prev,
        ...vendor,
        availability: vendor.availability || prev.availability,
      }));
      const phoneDigits = vendor.phone?.replace(/\D/g, "") || "";
      const whatsappDigits = vendor.whatsapp?.replace(/\D/g, "") || "";
      setSameAsPhone(phoneDigits === whatsappDigits);
    } else if (isOpen) {
      setFormData(emptyForm);
      setSameAsPhone(true);
    }
  }, [vendor, isOpen]);

  const errors = useMemo(
    () => ({
      name: validators.name(formData.name),
      businessName: validators.businessName(formData.businessName),
      phone: validators.phone(formData.phone),
      email: validators.email(formData.email),
    }),
    [formData.name, formData.businessName, formData.phone, formData.email],
  );

  const isFormValid =
    !errors.name && !errors.businessName && !errors.phone && !errors.email;
  const showError = (field: keyof typeof errors) =>
    (touched[field] || attemptedSubmit) && errors[field];
  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleInputChange = (field: string, value: any) => {
    if (field === "phone") {
      const digits = stripToDigits(value, 10);
      setFormData((prev: any) => ({
        ...prev,
        phone: digits,
        whatsapp: sameAsPhone ? digits : prev.whatsapp,
      }));
      return;
    }
    if (field === "whatsapp") {
      setFormData((prev: any) => ({
        ...prev,
        whatsapp: stripToDigits(value, 10),
      }));
      return;
    }
    if (field === "name" || field === "businessName") {
      setFormData((prev: any) => ({ ...prev, [field]: stripToLetters(value) }));
      return;
    }
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSameAsPhoneChange = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setFormData((prev: any) => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  const clampNumber = (value: number, min: number, max: number) =>
    Number.isFinite(value) ? Math.min(Math.max(value, min), max) : min;

  const addMasterValue = async (canonicalName: string, value: string) => {
    const result = await persistMasterOption(catalog, canonicalName, value);
    setCatalog(result.catalog);
    return result.value;
  };

  const handleAddSelect = async (
    canonicalName: string,
    field: string,
    value: string,
  ) => {
    const saved = await addMasterValue(canonicalName, value);
    if (saved) handleInputChange(field, saved);
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev: any) => ({ ...prev, category }));
  };

  const handleAddCategory = async () => {
    const saved = await addMasterValue(
      VENDOR_MASTER_TYPES.category,
      newCategory,
    );
    if (saved) {
      handleCategoryChange(saved);
      setNewCategory("");
      setAddingCategory(false);
    }
  };

  const addService = async () => {
    if (!newService.name.trim()) return;
    await addMasterValue(VENDOR_MASTER_TYPES.services, newService.name);
    if (newService.unit) {
      await addMasterValue(VENDOR_MASTER_TYPES.serviceUnit, newService.unit);
    }
    setFormData((prev: any) => ({
      ...prev,
      services: [...prev.services, { ...newService }],
    }));
    setNewService({
      name: "",
      rate: "",
      unit: serviceUnits[0]?.value || "",
      description: "",
    });
  };

  const removeService = (index: number) =>
    setFormData((prev: any) => ({
      ...prev,
      services: prev.services.filter((_: any, i: number) => i !== index),
    }));

  const handleMultiSelectChange = (
    field: "tags" | "languages" | "certifications",
    values: string[],
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: values,
    }));
  };

  const handleMultiSelectAdd = async (
    canonicalName: string,
    field: "tags" | "languages" | "certifications",
    value: string,
  ) => {
    const saved = await addMasterValue(canonicalName, value);
    if (saved) {
      setFormData((prev: any) => ({
        ...prev,
        [field]: prev[field].includes(saved)
          ? prev[field]
          : [...prev[field], saved],
      }));
    }
  };

  const removeChipValue = (
    field: "tags" | "languages" | "certifications",
    value: string,
  ) =>
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((item: string) => item !== value),
    }));

  const handleAvailabilityChange = (field: string, value: any) =>
    setFormData((prev: any) => ({
      ...prev,
      availability: { ...prev.availability, [field]: value },
    }));

  const handleDayToggle = (day: string) =>
    setFormData((prev: any) => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter((d: string) => d !== day)
          : [...prev.availability.days, day],
      },
    }));

  const handleSave = async () => {
    setAttemptedSubmit(true);
    setTouched({ name: true, businessName: true, phone: true, email: true });
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const vendorData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ""),
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        created_at: vendor?.created_at || new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      await onSave(vendorData);
    } catch (error) {
      console.error("Error saving vendor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeCategory = categories.find((c) => c.value === formData.category);
  const ActiveIcon = activeCategory
    ? categoryIconFor(activeCategory.label)
    : Building2;

  const ChipList = ({
    items,
    onRemove,
    maxDisplay = 3,
  }: {
    items: string[];
    onRemove: (value: string) => void;
    maxDisplay?: number;
  }) => {
    const [showAll, setShowAll] = useState(false);
    const displayItems = showAll ? items : items.slice(0, maxDisplay);
    const remainingCount = items.length - maxDisplay;

    if (items.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {displayItems.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#F5F1E9] text-[#5B564C] rounded-full border border-[#E3DECF] text-[9px]"
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="text-[#B4AC9E] hover:text-[#B3413E] transition-colors"
            >
              <X size={8} />
            </button>
          </span>
        ))}
        {!showAll && remainingCount > 0 && (
          <span
            className="px-2 py-0.5 text-[9px] text-[#A97142] font-medium cursor-pointer hover:underline rounded-full border border-dashed border-[#A97142]/50"
            onClick={() => setShowAll(true)}
          >
            +{remainingCount}
          </span>
        )}
        {showAll && items.length > maxDisplay && (
          <span
            className="px-2 py-0.5 text-[9px] text-[#8A8375] font-medium cursor-pointer hover:underline"
            onClick={() => setShowAll(false)}
          >
            Show less
          </span>
        )}
      </div>
    );
  };

  const getFullPhoneNumber = () => {
    return `${formData.countryCode} ${formData.phone}`;
  };

  return (
    <div className="fixed inset-0 bg-[#14161C]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap');
        .vf-font-serif { font-family: 'Fraunces', Georgia, serif; }
        .vf-font-sans { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      <div className="vf-font-sans bg-[#FAF7F2] rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden border border-[#E3DECF] shadow-[0_40px_80px_-24px_rgba(20,22,28,0.5)] flex flex-col">
        {/* Header */}
        <div className="relative bg-[#0E3658] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#A97142]/20 border border-[#A97142]/40 flex items-center justify-center">
              <Building2
                className="w-4 h-4 text-[#D8B48C]"
                strokeWidth={1.75}
              />
            </div>
            <div>
              <h2 className="vf-font-serif text-[16px] text-white leading-tight">
                {vendor ? "Edit vendor record" : "New vendor record"}
              </h2>
              <p className="text-[10px] text-[#9BA0AE] -mt-0.5">
                {vendor
                  ? "Update the details on file"
                  : "Add a verified trade professional"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeCategory && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-[#D8B48C]">
                <ActiveIcon className="w-3 h-3" strokeWidth={1.75} />
                {activeCategory.label}
              </div>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="h-[2px] flex-shrink-0 bg-gradient-to-r from-[#A97142] via-[#D8B48C] to-transparent" />

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="space-y-4">
            {/* Section 1: Identity & Craft */}
            <section>
              <SectionHeading index="01" title="Identity & Craft" icon={User} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Field label="Salutation" className="col-span-1">
                  <VendorMasterSelect
                    value={formData.salutation}
                    options={salutations}
                    onChange={(value) => handleInputChange("salutation", value)}
                    onAdd={(value) =>
                      handleAddSelect(
                        VENDOR_MASTER_TYPES.salutation,
                        "salutation",
                        value,
                      )
                    }
                  />
                </Field>
                <Field
                  label="Contact name"
                  required
                  error={showError("name")}
                  className="col-span-1"
                >
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={() => markTouched("name")}
                    className={inputClass(!!showError("name"))}
                    placeholder="Full name"
                  />
                </Field>
                <Field
                  label="Business name"
                  required
                  error={showError("businessName")}
                  className="col-span-1"
                >
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    onBlur={() => markTouched("businessName")}
                    className={inputClass(!!showError("businessName"))}
                    placeholder="Business name"
                  />
                </Field>
                <Field label="Experience" className="col-span-1">
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) =>
                        handleInputChange(
                          "experience",
                          clampNumber(Number(e.target.value), 1, 50),
                        )
                      }
                      className={inputClass(false)}
                      min={1}
                      max={50}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#B4AC9E]">
                      yrs
                    </span>
                  </div>
                </Field>
                <Field label="Rating" className="col-span-1">
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.rating}
                      onChange={(e) =>
                        handleInputChange(
                          "rating",
                          clampNumber(Number(e.target.value), 1, 5),
                        )
                      }
                      className={inputClass(false)}
                      min={1}
                      max={5}
                      step={0.1}
                    />
                    <Star className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#D8B48C]" />
                  </div>
                </Field>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {categories.map((cat) => {
                  const Icon = categoryIconFor(cat.label);
                  const isSelected = formData.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                        isSelected
                          ? "bg-[#0E3658] text-white border-[#0E3658] shadow-md shadow-[#0E3658]/20"
                          : "bg-white text-[#5B564C] border-[#E3DECF] hover:border-[#A97142]/50 hover:bg-[#FBF9F5]"
                      }`}
                    >
                      <Icon
                        className={`w-3 h-3 ${isSelected ? "text-[#D8B48C]" : "text-[#8A8375]"}`}
                        strokeWidth={1.75}
                      />
                      {cat.label}
                    </button>
                  );
                })}
                {addingCategory ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddCategory()
                      }
                      placeholder="New craft"
                      className="px-2 py-1 bg-white border border-[#E3DECF] rounded-full text-[10px] w-24 focus:outline-none focus:border-[#A97142]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="w-6 h-6 rounded-full bg-[#0E3658] text-white flex items-center justify-center hover:bg-[#1a4a7a] transition-colors"
                    >
                      <Check size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingCategory(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border border-dashed border-[#A97142]/50 text-[#A97142] hover:bg-[#FBF9F5] transition-colors"
                  >
                    <Plus size={10} /> Add
                  </button>
                )}
              </div>
            </section>

            <div className="border-t border-[#E3DECF]" />

            {/* Section 2: Contact */}
            <section>
              <SectionHeading index="02" title="Contact" icon={Phone} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Phone number" required error={showError("phone")}>
                  <div className="flex gap-2">
                    <div className="w-[120px] min-w-[120px] flex-shrink-0">
                      <VendorMasterSelect
                        value={formData.countryCode}
                        options={countryCodes}
                        onChange={(value) =>
                          handleInputChange("countryCode", value)
                        }
                        onAdd={(value) =>
                          handleAddSelect(
                            VENDOR_MASTER_TYPES.countryCode,
                            "countryCode",
                            value,
                          )
                        }
                        placeholder="Code"
                      />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      onBlur={() => markTouched("phone")}
                      className={inputClass(!!showError("phone"))}
                      placeholder="10-digit number"
                    />
                  </div>
                </Field>
                <Field label="WhatsApp number">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={(e) =>
                          handleSameAsPhoneChange(e.target.checked)
                        }
                        className="rounded border-[#E3DECF] text-[#0E3658] focus:ring-[#A97142] w-3.5 h-3.5"
                      />
                      <span className="text-[10px] text-[#5B564C] font-medium">
                        Same as phone
                      </span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        handleInputChange("whatsapp", e.target.value)
                      }
                      className={`${inputClass(false)} flex-1`}
                      placeholder={
                        sameAsPhone
                          ? getFullPhoneNumber()
                          : "Enter WhatsApp number"
                      }
                      disabled={sameAsPhone}
                    />
                  </div>
                </Field>
                <Field
                  label="Email address"
                  required
                  error={showError("email")}
                >
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => markTouched("email")}
                    className={inputClass(!!showError("email"))}
                    placeholder="name@business.com"
                  />
                </Field>
                <Field label="Address">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B4AC9E]" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className={`${inputClass(false)} pl-8`}
                      placeholder="Shop / office address"
                    />
                  </div>
                </Field>
              </div>
            </section>

            <div className="border-t border-[#E3DECF]" />

            {/* Section 3: Rates & Services */}
            <section>
              <SectionHeading
                index="03"
                title="Rates & Services"
                icon={Briefcase}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <Field label="Completed jobs">
                  <input
                    type="number"
                    value={formData.completedProjects}
                    onChange={(e) =>
                      handleInputChange(
                        "completedProjects",
                        clampNumber(Number(e.target.value), 0, 100000),
                      )
                    }
                    className={inputClass(false)}
                    min={0}
                    placeholder="0"
                  />
                </Field>
                <Field label="Response time">
                  <VendorMasterSelect
                    value={formData.responseTime}
                    options={responseTimes}
                    onChange={(value) =>
                      handleInputChange("responseTime", value)
                    }
                    onAdd={(value) =>
                      handleAddSelect(
                        VENDOR_MASTER_TYPES.responseTime,
                        "responseTime",
                        value,
                      )
                    }
                  />
                </Field>
                <Field label="Rate idea">
                  <input
                    type="text"
                    value={formData.rateIdea}
                    onChange={(e) =>
                      handleInputChange("rateIdea", e.target.value)
                    }
                    className={inputClass(false)}
                    placeholder="₹500-1500/visit"
                  />
                </Field>
              </div>

              <div className="bg-white rounded-xl border border-[#E3DECF] p-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input
                    type="text"
                    list="vendor-service-options"
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    className={inputClass(false)}
                    placeholder="Service name"
                  />
                  <datalist id="vendor-service-options">
                    {serviceOptions.map((option) => (
                      <option key={option.value} value={option.value} />
                    ))}
                  </datalist>
                  {/* Rate Input with ₹ Prefix */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#0E3658] font-medium pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={newService.rate}
                      onChange={(e) =>
                        setNewService({ ...newService, rate: e.target.value })
                      }
                      className={`${inputClass(false)} pl-7`}
                      placeholder="Rate"
                    />
                  </div>
                  <VendorMasterSelect
                    value={newService.unit}
                    options={serviceUnits}
                    onChange={(value) =>
                      setNewService({ ...newService, unit: value })
                    }
                    onAdd={async (value) => {
                      const saved = await addMasterValue(
                        VENDOR_MASTER_TYPES.serviceUnit,
                        value,
                      );
                      if (saved)
                        setNewService((prev) => ({ ...prev, unit: saved }));
                    }}
                    placeholder="Unit"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newService.description}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        description: e.target.value,
                      })
                    }
                    className={`${inputClass(false)} flex-1`}
                    placeholder="Service description (optional)"
                  />
                  <button
                    onClick={addService}
                    className="px-4 py-1.5 bg-[#0E3658] text-white rounded-lg hover:bg-[#1a4a7a] transition-colors text-[11px] font-medium flex items-center gap-1 whitespace-nowrap"
                  >
                    <Plus size={12} /> Add Service
                  </button>
                </div>

                {formData.services.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3 max-h-32 overflow-y-auto pr-1">
                    {formData.services.map((service: any, index: number) => (
                      <div
                        key={`${service.name}-${index}`}
                        className="bg-[#FBF9F5] rounded-lg p-2 border border-[#E3DECF] hover:border-[#A97142]/30 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-medium text-[#0E3658] truncate">
                              {service.name}
                            </div>
                            {service.description && (
                              <div className="text-[9px] text-[#8A8375] truncate">
                                {service.description}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] font-semibold text-[#3F7856]">
                                {service.rate}
                              </span>
                              <span className="text-[8px] text-[#B4AC9E]">
                                {service.unit}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeService(index)}
                            className="text-[#C79B95] hover:text-[#B3413E] transition-colors flex-shrink-0"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <div className="border-t border-[#E3DECF]" />

            {/* Section 4: Schedule */}
            <section>
              <SectionHeading index="04" title="Schedule" icon={Calendar} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Working days">
                  <div className="flex flex-wrap gap-1">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleDayToggle(day.value)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                          formData.availability.days.includes(day.value)
                            ? "bg-[#0E3658] text-white border-[#0E3658] shadow-sm shadow-[#0E3658]/20"
                            : "bg-white text-[#8A8375] border-[#E3DECF] hover:border-[#0E3658]/50"
                        }`}
                      >
                        {day.label.slice(0, 3)}
                      </button>
                    ))}
                    {addingDay ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={newDay}
                          onChange={(e) => setNewDay(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key !== "Enter") return;
                            const saved = await addMasterValue(
                              VENDOR_MASTER_TYPES.weekDays,
                              newDay,
                            );
                            if (saved) {
                              handleDayToggle(saved);
                              setNewDay("");
                              setAddingDay(false);
                            }
                          }}
                          placeholder="New day"
                          className="px-2 py-1 bg-white border border-[#E3DECF] rounded-lg text-[10px] w-16 focus:outline-none focus:border-[#A97142]"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const saved = await addMasterValue(
                              VENDOR_MASTER_TYPES.weekDays,
                              newDay,
                            );
                            if (saved) {
                              handleDayToggle(saved);
                              setNewDay("");
                              setAddingDay(false);
                            }
                          }}
                          className="w-6 h-6 rounded-lg bg-[#0E3658] text-white flex items-center justify-center hover:bg-[#1a4a7a] transition-colors"
                        >
                          <Check size={10} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingDay(true)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium border border-dashed border-[#A97142]/50 text-[#A97142] hover:bg-[#FBF9F5] transition-colors"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </Field>
                <Field label="Working hours">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#B4AC9E]" />
                      <input
                        type="time"
                        value={formData.availability.startTime}
                        onChange={(e) =>
                          handleAvailabilityChange("startTime", e.target.value)
                        }
                        className={`${inputClass(false)} pl-8`}
                      />
                    </div>
                    <span className="text-[#B4AC9E] text-[10px] font-medium">
                      to
                    </span>
                    <div className="relative flex-1">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#B4AC9E]" />
                      <input
                        type="time"
                        value={formData.availability.endTime}
                        onChange={(e) =>
                          handleAvailabilityChange("endTime", e.target.value)
                        }
                        className={`${inputClass(false)} pl-8`}
                      />
                    </div>
                  </div>
                </Field>
                <Field label="Weekly off">
                  <VendorMasterSelect
                    value={formData.availability.weeklyOff}
                    options={weekDays}
                    onChange={(value) =>
                      handleAvailabilityChange("weeklyOff", value)
                    }
                    onAdd={async (value) => {
                      const saved = await addMasterValue(
                        VENDOR_MASTER_TYPES.weekDays,
                        value,
                      );
                      if (saved) handleAvailabilityChange("weeklyOff", saved);
                    }}
                  />
                </Field>
              </div>
            </section>

            <div className="border-t border-[#E3DECF]" />

            {/* Section 5: Profile */}
            <section>
              <SectionHeading index="05" title="Profile" icon={Tag} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-[#E3DECF] p-3">
                  <p className="text-[10px] font-medium text-[#5B564C] mb-2 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-[#A97142]" /> Tags
                  </p>
                  <MultiSelect
                    options={tagOptions}
                    selectedValues={formData.tags}
                    onChange={(values) =>
                      handleMultiSelectChange("tags", values)
                    }
                    placeholder="Select or add tag"
                    onAdd={(value) =>
                      handleMultiSelectAdd(
                        VENDOR_MASTER_TYPES.tags,
                        "tags",
                        value,
                      )
                    }
                    addPlaceholder="Enter tag name"
                  />
                  <ChipList
                    items={formData.tags}
                    onRemove={(value) => removeChipValue("tags", value)}
                    maxDisplay={3}
                  />
                </div>

                <div className="bg-white rounded-xl border border-[#E3DECF] p-3">
                  <p className="text-[10px] font-medium text-[#5B564C] mb-2 flex items-center gap-1.5">
                    <Languages className="w-3 h-3 text-[#A97142]" /> Languages
                  </p>
                  <MultiSelect
                    options={languageOptions}
                    selectedValues={formData.languages}
                    onChange={(values) =>
                      handleMultiSelectChange("languages", values)
                    }
                    placeholder="Select or add language"
                    onAdd={(value) =>
                      handleMultiSelectAdd(
                        VENDOR_MASTER_TYPES.languages,
                        "languages",
                        value,
                      )
                    }
                    addPlaceholder="Enter language name"
                  />
                  <ChipList
                    items={formData.languages}
                    onRemove={(value) => removeChipValue("languages", value)}
                    maxDisplay={3}
                  />
                </div>

                <div className="bg-white rounded-xl border border-[#E3DECF] p-3">
                  <p className="text-[10px] font-medium text-[#5B564C] mb-2 flex items-center gap-1.5">
                    <Award className="w-3 h-3 text-[#A97142]" /> Certifications
                  </p>
                  <MultiSelect
                    options={certificationOptions}
                    selectedValues={formData.certifications}
                    onChange={(values) =>
                      handleMultiSelectChange("certifications", values)
                    }
                    placeholder="Select or add certification"
                    onAdd={(value) =>
                      handleMultiSelectAdd(
                        VENDOR_MASTER_TYPES.certifications,
                        "certifications",
                        value,
                      )
                    }
                    addPlaceholder="Enter certification name"
                  />
                  <ChipList
                    items={formData.certifications}
                    onRemove={(value) =>
                      removeChipValue("certifications", value)
                    }
                    maxDisplay={3}
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-[#E3DECF]" />

            {/* Section 6: Notes & Verification */}
            <section>
              <SectionHeading
                index="06"
                title="Notes & Verification"
                icon={Shield}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Status">
                  <VendorMasterSelect
                    value={formData.status}
                    options={statuses}
                    onChange={(value) => handleInputChange("status", value)}
                    onAdd={(value) =>
                      handleAddSelect(
                        VENDOR_MASTER_TYPES.status,
                        "status",
                        value,
                      )
                    }
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className={`${inputClass(false)} resize-none`}
                    rows={3}
                    placeholder="Brief description about the vendor and services..."
                  />
                </Field>
                <div className="bg-white rounded-xl border border-[#E3DECF] p-3">
                  <p className="text-[10px] font-medium text-[#5B564C] mb-2">
                    Verification Badges
                  </p>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-[#FBF9F5] transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.verified}
                        onChange={(e) =>
                          handleInputChange("verified", e.target.checked)
                        }
                        className="rounded border-[#E3DECF] text-[#0E3658] focus:ring-[#A97142] w-3.5 h-3.5"
                      />
                      <BadgeCheck className="w-3.5 h-3.5 text-[#3F7856]" />
                      <span className="text-[10px] text-[#3B3730] font-medium">
                        Verified
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-[#FBF9F5] transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.reExpertVerified}
                        onChange={(e) =>
                          handleInputChange(
                            "reExpertVerified",
                            e.target.checked,
                          )
                        }
                        className="rounded border-[#E3DECF] text-[#0E3658] focus:ring-[#A97142] w-3.5 h-3.5"
                      />
                      <Crown className="w-3.5 h-3.5 text-[#A97142]" />
                      <span className="text-[10px] text-[#3B3730] font-medium">
                        RE Expert
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-[#FBF9F5] transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.reSuggested}
                        onChange={(e) =>
                          handleInputChange("reSuggested", e.target.checked)
                        }
                        className="rounded border-[#E3DECF] text-[#0E3658] focus:ring-[#A97142] w-3.5 h-3.5"
                      />
                      <Award className="w-3.5 h-3.5 text-[#3F7856]" />
                      <span className="text-[10px] text-[#3B3730] font-medium">
                        RE Suggested
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E3DECF] bg-white/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[9px] text-[#8A8375]">
            <AlertCircle className="w-3 h-3 text-[#A97142]" />
            <span>
              Fields marked{" "}
              <span className="text-[#B3413E] font-medium">*</span> are required
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-[11px] font-medium text-[#5B564C] bg-white border border-[#E3DECF] rounded-lg hover:bg-[#FBF9F5] transition-all hover:border-[#A97142]/30"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || (attemptedSubmit && !isFormValid)}
              className="flex items-center gap-1.5 px-5 py-1.5 bg-[#0E3658] text-white rounded-lg hover:bg-[#1a4a7a] transition-all text-[11px] font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#0E3658]/20"
            >
              <Save size={12} />
              {isSubmitting ? "Saving..." : vendor ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorFormModal;
