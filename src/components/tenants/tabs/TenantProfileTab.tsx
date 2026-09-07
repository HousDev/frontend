import React, { useState, useMemo } from "react";
import {
  Phone,
  Mail,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  Key,
  User as UserIcon,
  MapPin,
  Home,
  Calendar,
  Sofa,
  Star,
  Navigation,
  X,
  Save,
  Eye,
  EyeOff,
  Lock,
  Copy,
  CopyCheck,
  Check,
  Loader2,
  Shield,
} from "lucide-react";
import { toast } from "react-toastify";
import { tenantAPI } from "@/lib/tenantAPI";
import { Tenant, MatchedProperty } from "./types";

interface TenantProfileTabProps {
  tenant: Tenant;
  matchedProperties: MatchedProperty[];
  onUpdate?: (data: any) => void;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  "Active Search": {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 size={11} />,
  },
  Interested: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    text: "text-amber-700",
    icon: <AlertCircle size={11} />,
  },
  "Agreement Signed": {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    text: "text-purple-700",
    icon: <Key size={11} />,
  },
  Inactive: {
    bg: "bg-gray-100 text-gray-600 border-gray-200",
    text: "text-gray-500",
    icon: <Clock size={11} />,
  },
};

function fmtINR(val: number | string) {
  const n = Number(val);
  return n > 0 ? `₹${n.toLocaleString("en-IN")}` : "—";
}

function getInitials(name: string) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function parseArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

// Editable Field Component
const EditableField = ({
  label,
  value,
  onSave,
  type = "text",
  options = [],
  placeholder = "",
  isTextArea = false,
  icon,
}: {
  label: string;
  value: string | number;
  onSave: (val: any) => void;
  type?: string;
  options?: string[];
  placeholder?: string;
  isTextArea?: boolean;
  icon?: React.ReactNode;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-gray-400">
          <span className="text-orange-500">{icon}</span>
          {label}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[9px] text-orange-500 hover:text-orange-600 font-medium"
          >
            <Edit size={11} />
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-1.5">
          {isTextArea ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
              rows={2}
              placeholder={placeholder}
            />
          ) : type === "select" ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : type === "date" ? (
            <input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
              placeholder={placeholder}
            />
          )}
          <div className="flex gap-1.5">
            <button
              onClick={handleSave}
              className="px-2 py-0.5 bg-orange-500 text-white rounded text-[9px] font-medium hover:bg-orange-600"
            >
              <Save size={10} />
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[9px] font-medium hover:bg-gray-300"
            >
              <X size={10} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[11px] font-bold text-slate-900">
          {value || "—"}
        </div>
      )}
    </div>
  );
};

// Preference Group with Edit Capability
const EditablePreferenceGroup = ({
  icon,
  label,
  values,
  allOptions,
  onUpdate,
}: {
  icon: React.ReactNode;
  label: string;
  values: string[];
  allOptions?: string[];
  onUpdate: (newValues: string[]) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(values);

  const handleToggle = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSave = () => {
    onUpdate(selectedValues);
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-gray-400">
          <span className="text-orange-500">{icon}</span>
          {label}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[9px] text-orange-500 hover:text-orange-600 font-medium"
          >
            <Edit size={11} />
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1">
            {allOptions?.map((option) => (
              <button
                key={option}
                onClick={() => handleToggle(option)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                  selectedValues.includes(option)
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleSave}
              className="px-2 py-0.5 bg-orange-500 text-white rounded text-[9px] font-medium hover:bg-orange-600"
            >
              <Save size={10} />
            </button>
            <button
              onClick={() => {
                setSelectedValues(values);
                setIsEditing(false);
              }}
              className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[9px] font-medium hover:bg-gray-300"
            >
              <X size={10} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1">
          {values.length > 0 ? (
            values.map((value) => (
              <span
                key={value}
                className="rounded border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600"
              >
                {value}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-gray-400">No data available</span>
          )}
        </div>
      )}
    </div>
  );
};

export default function TenantProfileTab({
  tenant,
  matchedProperties,
  onUpdate,
}: TenantProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const statusInfo = statusConfig[tenant.status] ?? statusConfig["Inactive"];
  const budgetMin = Number(tenant.budget_min) || 0;
  const budgetMax = Number(tenant.budget_max) || 0;

  const propertyPreferences = React.useMemo(() => {
    const furnishing = new Set<string>();
    const facilities = new Set<string>();
    const nearby = new Set<string>();
    let minArea = Infinity;
    let maxArea = 0;

    matchedProperties.forEach((property) => {
      if (property.furnishing)
        furnishing.add(String(property.furnishing).trim());
      parseArray(
        (property as any).amenities ?? (property as any).facilities,
      ).forEach((item) => {
        const label =
          typeof item === "string" ? item : item?.label || item?.name;
        if (label) facilities.add(String(label).trim());
      });
      parseArray(
        (property as any).nearby_places ?? (property as any).nearby,
      ).forEach((item) => {
        const label =
          typeof item === "string" ? item : item?.label || item?.name;
        if (label) nearby.add(String(label).trim());
      });
      const area = Number(
        (property as any).carpet_area ?? (property as any).builtup_area ?? 0,
      );
      if (area > 0) {
        minArea = Math.min(minArea, area);
        maxArea = Math.max(maxArea, area);
      }
    });

    return {
      furnishing: [...furnishing].filter(Boolean).sort(),
      facilities: [...facilities].filter(Boolean).sort(),
      nearby: [...nearby].filter(Boolean).sort(),
      minArea: minArea === Infinity ? 0 : minArea,
      maxArea,
    };
  }, [matchedProperties]);

  const rawPhone = (tenant.phone || "").replace(/\D/g, "");
  const rawWhatsApp = (tenant.whatsapp || tenant.phone || "").replace(
    /\D/g,
    "",
  );

  const handleCall = () => {
    if (rawPhone) window.location.href = `tel:${rawPhone}`;
  };

  const handleWhatsApp = () => {
    if (!rawWhatsApp) return;
    const message = encodeURIComponent(
      `Hi ${tenant.name},\n\n` +
        `Welcome to your Tenant Account Portal!\n` +
        `Requirement: ${tenant.preferred_bhk || "BHK"} in ${tenant.preferred_location || "preferred location"}.\n` +
        `Budget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}/mo.\n\n` +
        `Best Regards,\nResaleExpert Team`,
    );
    window.open(`https://wa.me/${rawWhatsApp}?text=${message}`, "_blank");
  };

  const handleEmail = () => {
    if (!tenant.email) return;
    const subject = encodeURIComponent(
      `Tenant Portal Summary - ${tenant.name}`,
    );
    const body = encodeURIComponent(
      `Dear ${tenant.name},\n\n` +
        `Here is a summary of your Tenant Account Portal:\n` +
        `Tenant ID: ${tenant.tenant_id}\n` +
        `Preferred BHK: ${tenant.preferred_bhk || "Not specified"}\n` +
        `Preferred Location: ${tenant.preferred_location || "Not specified"}\n` +
        `Monthly Rent Budget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}/mo\n\n` +
        `Best Regards,\nResaleExpert Team`,
    );
    window.location.href = `mailto:${tenant.email}?subject=${subject}&body=${body}`;
  };

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);

  const derivedUsername = useMemo(() => {
    if (tenant.username) return tenant.username;
    if (!tenant.name) return "tenant";
    const nameParts = tenant.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "tenant";
    const lastName = nameParts.slice(1).join("") || "";
    if (lastName) {
      return `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    }
    return firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
  }, [tenant.username, tenant.name]);

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(derivedUsername);
    setCopiedUsername(true);
    toast.success(`Username @${derivedUsername} copied!`);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setUpdatingPass(true);
    try {
      const res = await tenantAPI.updatePassword({
        email: tenant.email,
        tenant_id: tenant.id,
        new_password: newPassword,
      });
      if (res?.success) {
        toast.success(res.message || "Password updated successfully!");
        if (res.username && res.username !== tenant.username) {
          onUpdate?.({ ...tenant, username: res.username });
        }
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res?.message || "Failed to update password");
      }
    } catch (err: any) {
      console.error("Password update error:", err);
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleFieldUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({ ...tenant, [field]: value });
    }
  };

  return (
    <div className="space-y-3">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-4 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border-b border-orange-100">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
              {tenant.name ? getInitials(tenant.name) : <UserIcon size={22} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={tenant.name || ""}
                      onChange={(e) =>
                        handleFieldUpdate("name", e.target.value)
                      }
                      className="text-sm font-extrabold text-slate-900 border border-gray-200 rounded px-2 py-0.5 w-full"
                    />
                  ) : (
                    <div className="text-sm font-extrabold text-slate-900 truncate">
                      {tenant.name}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-500 truncate mt-0.5">
                    {isEditing ? (
                      <input
                        type="email"
                        value={tenant.email || ""}
                        onChange={(e) =>
                          handleFieldUpdate("email", e.target.value)
                        }
                        className="text-[10px] border border-gray-200 rounded px-1 py-0.5 w-full"
                      />
                    ) : (
                      tenant.email || "No email set"
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 text-[10px] font-medium flex items-center gap-1"
                >
                  <Edit size={12} />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border gap-1 ${statusInfo.bg}`}
                >
                  {statusInfo.icon}
                  <span>{tenant.status}</span>
                </span>
                {tenant.tenant_id && (
                  <span className="text-[9px] text-gray-400 font-semibold">
                    #{tenant.tenant_id}
                  </span>
                )}
                {tenant.preferred_location && (
                  <span className="text-[9px] text-gray-400 font-medium flex items-center gap-0.5">
                    <MapPin size={8} />
                    {tenant.preferred_location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Grid - All Editable */}
        <div className="px-3 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-gray-100">
          <EditableField
            label="Phone"
            value={tenant.phone || ""}
            onSave={(val) => handleFieldUpdate("phone", val)}
            icon={<Phone size={11} />}
          />
          <EditableField
            label="WhatsApp"
            value={tenant.whatsapp || tenant.phone || ""}
            onSave={(val) => handleFieldUpdate("whatsapp", val)}
            icon={<Phone size={11} />}
          />
          <EditableField
            label="Budget"
            value={`${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}`}
            onSave={() => {}}
            icon={<Home size={11} />}
          />
          <EditableField
            label="Preferred"
            value={tenant.preferred_bhk || "Any"}
            onSave={(val) => handleFieldUpdate("preferred_bhk", val)}
            icon={<Home size={11} />}
            type="select"
            options={["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Any"]}
          />
          <div className="col-span-2 sm:col-span-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
            <Calendar size={11} className="text-orange-500 shrink-0" />
            <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">
              Move-In Date:
            </span>
            {isEditing ? (
              <input
                type="date"
                value={tenant.move_in_date || ""}
                onChange={(e) =>
                  handleFieldUpdate("move_in_date", e.target.value)
                }
                className="text-[11px] font-bold text-slate-900 border border-gray-200 rounded px-1 py-0.5"
              />
            ) : (
              <span className="text-[11px] font-bold text-slate-900">
                {tenant.move_in_date
                  ? new Date(tenant.move_in_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not set"}
              </span>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[9px] text-orange-500 hover:text-orange-600 font-medium ml-auto"
              >
                <Edit size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Property Preferences - All Editable */}
        <div className="border-t border-gray-100 px-3 py-3">
          <div className="mb-2 text-xs font-bold text-slate-800">
            Property Preferences
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <EditablePreferenceGroup
              icon={<Sofa size={13} />}
              label="Furnishing"
              values={propertyPreferences.furnishing}
              allOptions={["Fully Furnished", "Semi Furnished", "Un-Furnished"]}
              onUpdate={(newValues) => {
                // Update furnishing preferences
                console.log("Furnishing updated:", newValues);
              }}
            />
            <EditablePreferenceGroup
              icon={<Star size={13} />}
              label="Facilities & Amenities"
              values={propertyPreferences.facilities}
              allOptions={[
                "24/7 Security",
                "CCTV",
                "Clubhouse",
                "Garden",
                "Gym",
                "Lift",
                "Parking",
                "Pet Park",
                "Pet Care",
              ]}
              onUpdate={(newValues) => {
                // Update facilities
                console.log("Facilities updated:", newValues);
              }}
            />
            <EditablePreferenceGroup
              icon={<Navigation size={13} />}
              label="Nearby"
              values={propertyPreferences.nearby}
              allOptions={[
                "Bus Stop",
                "College",
                "D-Mart",
                "IT Park",
                "Metro",
                "School",
              ]}
              onUpdate={(newValues) => {
                // Update nearby places
                console.log("Nearby updated:", newValues);
              }}
            />
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
              <div className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-gray-400">
                <Home size={13} className="text-orange-500" /> Area (sqft)
              </div>
              <div className="text-[11px] font-bold text-slate-900">
                {propertyPreferences.minArea > 0
                  ? `${propertyPreferences.minArea.toLocaleString("en-IN")} - ${propertyPreferences.maxArea.toLocaleString("en-IN")}`
                  : "No area data available"}
              </div>
            </div>
          </div>
        </div>

        {/* Account Credentials & Password Update Card */}
        <div className="border-t border-gray-100 px-3 py-3 space-y-3 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Key size={14} className="text-orange-500" />
                <span>Account Credentials & Password</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Use your login username or email with your password to access your tenant portal anytime.
              </p>
            </div>
          </div>

          {/* Username Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-orange-200/80 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                @
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-gray-500 block uppercase tracking-wider">
                  Your Portal Username
                </span>
                <span className="font-mono font-bold text-xs text-orange-600 truncate block">
                  @{derivedUsername}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyUsername}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px] border border-orange-200 transition-colors cursor-pointer"
            >
              {copiedUsername ? (
                <CopyCheck size={12} className="text-emerald-600" />
              ) : (
                <Copy size={12} />
              )}
              <span>{copiedUsername ? "Copied!" : "Copy Username"}</span>
            </button>
          </div>

          {/* Password Update Form */}
          <form onSubmit={handleUpdatePassword} className="space-y-2.5 bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <Lock size={12} className="text-gray-500" />
              <span>Update Portal Password</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[9.5px] font-semibold text-gray-600 block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 pr-8 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[9.5px] font-semibold text-gray-600 block mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={updatingPass || !newPassword}
                className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {updatingPass ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check size={12} />
                    <span>Set / Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-100 px-3 py-3 flex flex-wrap gap-2">
          <button
            onClick={handleCall}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Phone size={12} />
            Call
          </button>
          <button
            onClick={handleWhatsApp}
            className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Phone size={12} />
            WhatsApp
          </button>
          <button
            onClick={handleEmail}
            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Mail size={12} />
            Email
          </button>
        </div>
      </div>
    </div>
  );
}
