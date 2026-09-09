import React, { useState, useMemo, useEffect } from "react";
import {
  Phone, Mail, Edit, CheckCircle2, Clock, AlertCircle, Key,
  User as UserIcon, MapPin, Home, Calendar, Sofa, Star,
  Navigation, X, Save, Eye, EyeOff, Lock, Copy, CopyCheck,
  Check, Loader2, Shield, Briefcase, IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";
import { tenantAPI } from "@/lib/tenantAPI";
import { Tenant, MatchedProperty } from "./types";

interface TenantProfileTabProps {
  tenant: Tenant;
  matchedProperties: MatchedProperty[];
  onUpdate?: (data: any) => void;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  "Active Search": { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700", icon: <CheckCircle2 size={11} /> },
  "Interested":    { bg: "bg-amber-50 text-amber-700 border-amber-200",       text: "text-amber-700",   icon: <AlertCircle size={11} /> },
  "Agreement Signed": { bg: "bg-purple-50 text-purple-700 border-purple-200", text: "text-purple-700",  icon: <Key size={11} /> },
  "Inactive":      { bg: "bg-gray-100 text-gray-600 border-gray-200",         text: "text-gray-500",    icon: <Clock size={11} /> },
};

function fmtINR(val: number | string) {
  const n = Number(val);
  return n > 0 ? `₹${n.toLocaleString("en-IN")}` : "—";
}

function getInitials(name: string) {
  if (!name) return "";
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function parseArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

/* ──────────────────────────── helpers ──────────────────────────── */
const InputField = ({
  label, name, value, onChange, type = "text", options, placeholder, icon,
}: {
  label: string; name: string; value: string | number;
  onChange: (name: string, val: string) => void;
  type?: string; options?: string[]; placeholder?: string; icon?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5">
    <label className="text-[9.5px] font-bold uppercase tracking-wide text-gray-400 flex items-center gap-1">
      {icon && <span className="text-orange-500">{icon}</span>}
      {label}
    </label>
    {type === "select" && options ? (
      <select
        name={name}
        value={String(value)}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-orange-500 focus:bg-white transition"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={String(value ?? "")}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-orange-500 focus:bg-white transition"
      />
    )}
  </div>
);

/* ──────────────────────────── read-only display card ──────────────────────────── */
const ReadField = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
    <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
      {icon && <span className="text-orange-500">{icon}</span>}
      {label}
    </div>
    <div className="text-[11px] font-bold text-slate-900">{value || "—"}</div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════ */
export default function TenantProfileTab({ tenant, matchedProperties, onUpdate }: TenantProfileTabProps) {

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string | number>>({});

  /* Sync form when tenant changes or edit opens */
  useEffect(() => {
    setForm({
      name:                   tenant.name                   || "",
      email:                  tenant.email                  || "",
      phone:                  tenant.phone                  || "",
      whatsapp:               tenant.whatsapp               || tenant.phone || "",
      tenant_type:            tenant.tenant_type            || "Family",
      budget_min:             tenant.budget_min             || "",
      budget_max:             tenant.budget_max             || "",
      preferred_bhk:          tenant.preferred_bhk          || "Any",
      preferred_location:     tenant.preferred_location     || "",
      current_address:        tenant.current_address        || "",
      move_in_date:           tenant.move_in_date           || "",
      occupation_type:        tenant.occupation_type        || "Salaried",
      company_name:           tenant.company_name           || "",
      designation:            tenant.designation            || "",
      monthly_income:         tenant.monthly_income         || "",
      office_location:        tenant.office_location        || "",
      marital_status:         tenant.marital_status         || "Single",
      family_members_count:   tenant.family_members_count   || "1",
      expected_stay_duration: tenant.expected_stay_duration || "11 Months",
      food_preference:        tenant.food_preference        || "Any",
      has_pets:               tenant.has_pets               || "No",
      smoking_habits:         tenant.smoking_habits         || "No",
      vehicle_type:           tenant.vehicle_type           || "None",
    });
  }, [tenant]);

  const handleChange = (name: string, val: string) => {
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tenant.id) {
        await tenantAPI.update(tenant.id, form);
        onUpdate?.({ ...tenant, ...form });
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // reset form to tenant values
    setForm({
      name:                   tenant.name                   || "",
      email:                  tenant.email                  || "",
      phone:                  tenant.phone                  || "",
      whatsapp:               tenant.whatsapp               || tenant.phone || "",
      tenant_type:            tenant.tenant_type            || "Family",
      budget_min:             tenant.budget_min             || "",
      budget_max:             tenant.budget_max             || "",
      preferred_bhk:          tenant.preferred_bhk          || "Any",
      preferred_location:     tenant.preferred_location     || "",
      current_address:        tenant.current_address        || "",
      move_in_date:           tenant.move_in_date           || "",
      occupation_type:        tenant.occupation_type        || "Salaried",
      company_name:           tenant.company_name           || "",
      designation:            tenant.designation            || "",
      monthly_income:         tenant.monthly_income         || "",
      office_location:        tenant.office_location        || "",
      marital_status:         tenant.marital_status         || "Single",
      family_members_count:   tenant.family_members_count   || "1",
      expected_stay_duration: tenant.expected_stay_duration || "11 Months",
      food_preference:        tenant.food_preference        || "Any",
      has_pets:               tenant.has_pets               || "No",
      smoking_habits:         tenant.smoking_habits         || "No",
      vehicle_type:           tenant.vehicle_type           || "None",
    });
    setIsEditing(false);
  };

  const statusInfo = statusConfig[tenant.status] ?? statusConfig["Inactive"];
  const budgetMin = Number(tenant.budget_min) || 0;
  const budgetMax = Number(tenant.budget_max) || 0;

  const rawPhone    = (tenant.phone || "").replace(/\D/g, "");
  const rawWhatsApp = (tenant.whatsapp || tenant.phone || "").replace(/\D/g, "");

  const handleCall = () => { if (rawPhone) window.location.href = `tel:${rawPhone}`; };
  const handleWhatsApp = () => {
    if (!rawWhatsApp) return;
    const message = encodeURIComponent(`Hi ${tenant.name},\n\nWelcome to your Tenant Account Portal!\nRequirement: ${tenant.preferred_bhk || "BHK"} in ${tenant.preferred_location || "preferred location"}.\nBudget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}/mo.\n\nBest Regards,\nResaleExpert Team`);
    window.open(`https://wa.me/${rawWhatsApp}?text=${message}`, "_blank");
  };
  const handleEmail = () => {
    if (!tenant.email) return;
    window.location.href = `mailto:${tenant.email}?subject=Tenant Portal - ${tenant.name}`;
  };

  /* password section */
  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass]           = useState(false);
  const [updatingPass, setUpdatingPass]   = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);

  const derivedUsername = useMemo(() => {
    if (tenant.username) return tenant.username;
    if (!tenant.name) return "tenant";
    const parts = tenant.name.trim().split(/\s+/);
    const first = parts[0] || "tenant";
    const last  = parts.slice(1).join("") || "";
    return last
      ? `${first.charAt(0).toLowerCase()}${last.toLowerCase().replace(/[^a-z0-9]/g, "")}`
      : first.toLowerCase().replace(/[^a-z0-9]/g, "");
  }, [tenant.username, tenant.name]);

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(derivedUsername);
    setCopiedUsername(true);
    toast.success(`Username @${derivedUsername} copied!`);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { toast.error("Password must be at least 6 characters long"); return; }
    if (newPassword !== confirmPassword)         { toast.error("Passwords do not match"); return; }
    setUpdatingPass(true);
    try {
      const res = await tenantAPI.updatePassword({ email: tenant.email, tenant_id: tenant.id, new_password: newPassword });
      if (res?.success) {
        toast.success(res.message || "Password updated successfully!");
        if (res.username && res.username !== tenant.username) onUpdate?.({ ...tenant, username: res.username });
        setNewPassword(""); setConfirmPassword("");
      } else {
        toast.error(res?.message || "Failed to update password");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPass(false);
    }
  };

  /* profile completion */
  const profileCompletion = useMemo(() => {
    const checks = [
      { label: "Full Name",          weight: 10, val: tenant.name },
      { label: "Phone Number",        weight: 10, val: tenant.phone },
      { label: "Email Address",       weight: 10, val: tenant.email },
      { label: "Tenant Type",         weight: 10, val: tenant.tenant_type },
      { label: "Occupation",          weight: 10, val: tenant.occupation_type },
      { label: "Monthly Income",      weight: 10, val: tenant.monthly_income },
      { label: "Budget Range",        weight: 10, val: tenant.budget_max },
      { label: "Preferred BHK",       weight: 10, val: tenant.preferred_bhk },
      { label: "Preferred Location",  weight: 10, val: tenant.preferred_location },
      { label: "Food Preference",     weight:  5, val: tenant.food_preference },
      { label: "Move-in Date",        weight:  5, val: tenant.move_in_date },
    ];
    let total = 0;
    const missing: string[] = [];
    checks.forEach((c) => {
      const filled = c.val !== undefined && c.val !== null && String(c.val).trim() !== "" && String(c.val).trim() !== "0";
      if (filled) total += c.weight; else missing.push(c.label);
    });
    return { percent: Math.min(100, Math.round(total)), missing, isReady: total >= 70 };
  }, [tenant]);

  /* property prefs */
  const propertyPreferences = useMemo(() => {
    const furnishing = new Set<string>(), facilities = new Set<string>(), nearby = new Set<string>();
    let minArea = Infinity, maxArea = 0;
    matchedProperties.forEach((p) => {
      if (p.furnishing) furnishing.add(String(p.furnishing).trim());
      parseArray((p as any).amenities ?? (p as any).facilities).forEach((item: any) => {
        const lbl = typeof item === "string" ? item : item?.label || item?.name;
        if (lbl) facilities.add(String(lbl).trim());
      });
      parseArray((p as any).nearby_places ?? (p as any).nearby).forEach((item: any) => {
        const lbl = typeof item === "string" ? item : item?.label || item?.name;
        if (lbl) nearby.add(String(lbl).trim());
      });
      const area = Number((p as any).carpet_area ?? (p as any).builtup_area ?? 0);
      if (area > 0) { minArea = Math.min(minArea, area); maxArea = Math.max(maxArea, area); }
    });
    return {
      furnishing: [...furnishing].filter(Boolean).sort(),
      facilities: [...facilities].filter(Boolean).sort(),
      nearby:     [...nearby].filter(Boolean).sort(),
      minArea: minArea === Infinity ? 0 : minArea,
      maxArea,
    };
  }, [matchedProperties]);

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="space-y-3">

      {/* ── Profile Completion Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-4 text-white shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Shield size={16} />
              </span>
              <h3 className="font-bold text-sm text-white tracking-wide">Tenant Profile Completeness Tracker</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                profileCompletion.percent >= 80 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : profileCompletion.percent >= 50 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}>
                {profileCompletion.percent}% Complete
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {profileCompletion.percent >= 80
                ? "✨ Great job! Your profile is complete and ready for instant owner confirmation and highest match scores."
                : "Complete missing details below to unlock 100% accurate match scores and faster owner approvals."}
            </p>
          </div>
          <div className="w-full sm:w-48 shrink-0">
            <div className="flex justify-between text-[10px] font-semibold text-slate-300 mb-1">
              <span>Profile Health</span><span>{profileCompletion.percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className={`h-full transition-all duration-500 rounded-full ${
                profileCompletion.percent >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : profileCompletion.percent >= 50 ? "bg-gradient-to-r from-amber-500 to-orange-400"
                : "bg-gradient-to-r from-rose-500 to-orange-500"
              }`} style={{ width: `${profileCompletion.percent}%` }} />
            </div>
          </div>
        </div>
        {profileCompletion.missing.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="text-[10px] font-bold text-orange-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlertCircle size={11} /><span>Missing Details ({profileCompletion.missing.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profileCompletion.missing.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[10px] font-medium border border-slate-700 flex items-center gap-1">
                  <span className="text-orange-400">+</span>{m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Main Profile Card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-4 py-4 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border-b border-orange-100">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
              {tenant.name ? getInitials(tenant.name) : <UserIcon size={22} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 truncate">{tenant.name}</div>
                  <div className="text-[10px] text-gray-500 truncate mt-0.5">{tenant.email || "No email set"}</div>
                </div>
                {/* Edit / Save / Cancel buttons */}
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 text-[10px] font-medium flex items-center gap-1"
                      >
                        <X size={12} /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm disabled:opacity-60"
                      >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        {saving ? "Saving..." : "Save Profile"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 text-[10px] font-medium flex items-center gap-1"
                    >
                      <Edit size={12} /> Edit Profile
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border gap-1 ${statusInfo.bg}`}>
                  {statusInfo.icon}<span>{tenant.status}</span>
                </span>
                {tenant.tenant_id && <span className="text-[9px] text-gray-400 font-semibold">#{tenant.tenant_id}</span>}
                {tenant.preferred_location && (
                  <span className="text-[9px] text-gray-400 font-medium flex items-center gap-0.5">
                    <MapPin size={8} />{tenant.preferred_location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ EDIT MODE — Full Form ══════════ */}
        {isEditing ? (
          <div className="px-4 py-5 space-y-6">

            {/* Section: Basic Information */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="p-1 rounded-md bg-blue-50 text-blue-600"><UserIcon size={14} /></span>
                <span className="text-xs font-bold text-slate-800">Basic Information</span>
                <span className="text-[10px] text-gray-400 font-normal">Contact info & account details</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InputField label="Full Name"          name="name"               value={form.name}               onChange={handleChange} icon={<UserIcon size={11} />} />
                <InputField label="Email"              name="email"              value={form.email}              onChange={handleChange} type="email" icon={<Mail size={11} />} />
                <InputField label="Phone"              name="phone"              value={form.phone}              onChange={handleChange} icon={<Phone size={11} />} />
                <InputField label="WhatsApp"           name="whatsapp"           value={form.whatsapp}           onChange={handleChange} icon={<Phone size={11} />} />
                <InputField label="Tenant Type"        name="tenant_type"        value={form.tenant_type}        onChange={handleChange} type="select" options={["Family","Bachelor Male","Bachelor Female","Company Lease","Any"]} icon={<UserIcon size={11} />} />
                <InputField label="Budget Min (₹)"     name="budget_min"         value={form.budget_min}         onChange={handleChange} type="number" placeholder="e.g. 15000" icon={<IndianRupee size={11} />} />
                <InputField label="Budget Max (₹)"     name="budget_max"         value={form.budget_max}         onChange={handleChange} type="number" placeholder="e.g. 30000" icon={<IndianRupee size={11} />} />
                <InputField label="Preferred BHK"      name="preferred_bhk"      value={form.preferred_bhk}      onChange={handleChange} type="select" options={["1 RK","1 BHK","2 BHK","3 BHK","4 BHK","Any"]} icon={<Home size={11} />} />
                <InputField label="Preferred Location" name="preferred_location" value={form.preferred_location} onChange={handleChange} placeholder="e.g. Wakad, Hinjewadi" icon={<MapPin size={11} />} />
                <InputField label="Current Address"    name="current_address"    value={form.current_address}    onChange={handleChange} placeholder="Current city / locality" icon={<MapPin size={11} />} />
                <InputField label="Move-In Date"       name="move_in_date"       value={form.move_in_date}       onChange={handleChange} type="date" icon={<Calendar size={11} />} />
              </div>
            </div>

            {/* Section: Occupancy & Employment */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="p-1 rounded-md bg-indigo-50 text-indigo-600"><Briefcase size={14} /></span>
                <span className="text-xs font-bold text-slate-800">Occupancy & Employment Profile</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InputField label="Occupation Type"       name="occupation_type"        value={form.occupation_type}        onChange={handleChange} type="select" options={["Salaried","Self-Employed","Business","Student","Other"]} />
                <InputField label="Company Name"          name="company_name"           value={form.company_name}           onChange={handleChange} placeholder="e.g. Infosys, Google" />
                <InputField label="Designation"           name="designation"            value={form.designation}            onChange={handleChange} placeholder="e.g. Software Engineer" />
                <InputField label="Monthly Income (₹)"   name="monthly_income"         value={form.monthly_income}         onChange={handleChange} type="number" placeholder="e.g. 75000" />
                <InputField label="Office Location"       name="office_location"        value={form.office_location}        onChange={handleChange} placeholder="e.g. Phase 1, Hinjewadi" />
                <InputField label="Marital Status"        name="marital_status"         value={form.marital_status}         onChange={handleChange} type="select" options={["Single","Married","Other"]} />
                <InputField label="Family Members Count"  name="family_members_count"   value={form.family_members_count}   onChange={handleChange} type="number" placeholder="e.g. 3" />
                <InputField label="Expected Stay"         name="expected_stay_duration" value={form.expected_stay_duration} onChange={handleChange} type="select" options={["11 Months","1 - 2 Years","2+ Years","Long Term"]} />
              </div>
            </div>

            {/* Section: Lifestyle & Preferences */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">🥗</span>
                <span className="text-xs font-bold text-slate-800">Lifestyle & Personal Preferences</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InputField label="Food Habit"     name="food_preference" value={form.food_preference} onChange={handleChange} type="select" options={["Veg Only","Veg/Non-Veg","Any"]} />
                <InputField label="Has Pets?"      name="has_pets"        value={form.has_pets}        onChange={handleChange} type="select" options={["No","Yes"]} />
                <InputField label="Smoking Habit"  name="smoking_habits"  value={form.smoking_habits}  onChange={handleChange} type="select" options={["No","Yes","Occasionally"]} />
                <InputField label="Vehicle Owned"  name="vehicle_type"    value={form.vehicle_type}    onChange={handleChange} type="select" options={["None","2-Wheeler","4-Wheeler","Both"]} />
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={handleCancel} className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5">
                <X size={13} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow disabled:opacity-60">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

        ) : (
          /* ══════════ READ MODE — display cards ══════════ */
          <>
            {/* Quick Info Grid */}
            <div className="px-3 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-gray-100">
              <ReadField label="Phone"            value={tenant.phone}                                           icon={<Phone size={11} />} />
              <ReadField label="WhatsApp"         value={tenant.whatsapp || tenant.phone}                        icon={<Phone size={11} />} />
              <ReadField label="Budget (Min-Max)" value={`${fmtINR(budgetMin)} – ${fmtINR(budgetMax)}`}          icon={<IndianRupee size={11} />} />
              <ReadField label="Preferred BHK"   value={tenant.preferred_bhk || "Any"}                          icon={<Home size={11} />} />
              <ReadField label="Tenant Type"     value={tenant.tenant_type || "—"}                               icon={<UserIcon size={11} />} />
              <ReadField label="Move-In Date"    value={tenant.move_in_date || "—"}                              icon={<Calendar size={11} />} />
              <ReadField label="Preferred Location" value={tenant.preferred_location || "—"}                     icon={<MapPin size={11} />} />
              <ReadField label="Current Address" value={tenant.current_address || "—"}                           icon={<MapPin size={11} />} />
            </div>

            {/* Occupancy & Employment */}
            <div className="px-3 py-3 border-b border-gray-100">
              <div className="mb-2 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="p-1 rounded bg-indigo-50 text-indigo-600">💼</span>
                <span>Occupancy & Employment Profile</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ReadField label="Occupation Type"      value={tenant.occupation_type || "—"} />
                <ReadField label="Company Name"         value={tenant.company_name || "—"} />
                <ReadField label="Designation"          value={tenant.designation || "—"} />
                <ReadField label="Monthly Income (₹)"  value={tenant.monthly_income ? fmtINR(tenant.monthly_income) : "—"} />
                <ReadField label="Office Location"      value={tenant.office_location || "—"} />
                <ReadField label="Marital Status"       value={tenant.marital_status || "Single"} />
                <ReadField label="Family Members Count" value={tenant.family_members_count ? `${tenant.family_members_count} Member(s)` : "1 Member"} />
                <ReadField label="Expected Stay"        value={tenant.expected_stay_duration || "11 Months"} />
              </div>
            </div>

            {/* Lifestyle */}
            <div className="px-3 py-3 border-b border-gray-100">
              <div className="mb-2 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="p-1 rounded bg-emerald-50 text-emerald-600">🥗</span>
                <span>Lifestyle & Personal Preferences</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ReadField label="Food Habit"    value={tenant.food_preference || "Any"} />
                <ReadField label="Has Pets?"     value={tenant.has_pets || "No"} />
                <ReadField label="Smoking Habit" value={tenant.smoking_habits || "No"} />
                <ReadField label="Vehicle Owned" value={tenant.vehicle_type || "None"} />
              </div>
            </div>

            {/* Property Preferences */}
            <div className="border-t border-gray-100 px-3 py-3">
              <div className="mb-2 text-xs font-bold text-slate-800">Property Preferences</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
                    <Sofa size={11} className="text-orange-500" /> Furnishing
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {propertyPreferences.furnishing.length > 0
                      ? propertyPreferences.furnishing.map((v) => <span key={v} className="rounded border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600">{v}</span>)
                      : <span className="text-[10px] text-gray-400">No data available</span>}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
                    <Star size={11} className="text-orange-500" /> Facilities & Amenities
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {propertyPreferences.facilities.length > 0
                      ? propertyPreferences.facilities.map((v) => <span key={v} className="rounded border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600">{v}</span>)
                      : <span className="text-[10px] text-gray-400">No data available</span>}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
                    <Navigation size={11} className="text-orange-500" /> Nearby
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {propertyPreferences.nearby.length > 0
                      ? propertyPreferences.nearby.map((v) => <span key={v} className="rounded border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600">{v}</span>)
                      : <span className="text-[10px] text-gray-400">No data available</span>}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
                    <Home size={11} className="text-orange-500" /> Area (sqft)
                  </div>
                  <div className="text-[11px] font-bold text-slate-900">
                    {propertyPreferences.minArea > 0
                      ? `${propertyPreferences.minArea.toLocaleString("en-IN")} – ${propertyPreferences.maxArea.toLocaleString("en-IN")}`
                      : "No area data available"}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Account Credentials & Password ── */}
        <div className="border-t border-gray-100 px-3 py-3 space-y-3 bg-slate-50/60">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Key size={14} className="text-orange-500" />
            <span>Account Credentials & Password</span>
          </div>
          <p className="text-[10px] text-gray-500">Use your login username or email with your password to access your tenant portal anytime.</p>

          {/* Username Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-orange-200/80 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">@</div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-gray-500 block uppercase tracking-wider">Your Portal Username</span>
                <span className="font-mono font-bold text-xs text-orange-600 truncate block">@{derivedUsername}</span>
              </div>
            </div>
            <button type="button" onClick={handleCopyUsername} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px] border border-orange-200 transition-colors cursor-pointer">
              {copiedUsername ? <CopyCheck size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copiedUsername ? "Copied!" : "Copy Username"}</span>
            </button>
          </div>

          {/* Password Form */}
          <form onSubmit={handleUpdatePassword} className="space-y-2.5 bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <Lock size={12} className="text-gray-500" /><span>Update Portal Password</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[9.5px] font-semibold text-gray-600 block mb-1">New Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} required minLength={6} placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 pr-8 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-orange-500 focus:bg-white transition" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[9.5px] font-semibold text-gray-600 block mb-1">Confirm Password</label>
                <input type={showPass ? "text" : "password"} required minLength={6} placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg text-xs font-medium outline-none transition ${
                    confirmPassword.length > 0
                      ? newPassword === confirmPassword ? "border-emerald-400 focus:border-emerald-500 bg-emerald-50/20" : "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : "border-gray-200 focus:border-orange-500 focus:bg-white"
                  }`} />
              </div>
            </div>
            {confirmPassword.length > 0 && (
              <div className="text-[10px] font-bold">
                {newPassword === confirmPassword
                  ? <span className="text-emerald-600">✓ Passwords match perfectly</span>
                  : <span className="text-rose-600">✗ Passwords do not match</span>}
              </div>
            )}
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={updatingPass || !newPassword}
                className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
                {updatingPass ? <><Loader2 size={12} className="animate-spin" /><span>Updating...</span></> : <><Check size={12} /><span>Set / Update Password</span></>}
              </button>
            </div>
          </form>
        </div>

        {/* ── Action Buttons ── */}
        <div className="border-t border-gray-100 px-3 py-3 flex flex-wrap gap-2">
          <button onClick={handleCall}     className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"><Phone size={12} />Call</button>
          <button onClick={handleWhatsApp} className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"><Phone size={12} />WhatsApp</button>
          <button onClick={handleEmail}    className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"><Mail size={12} />Email</button>
        </div>
      </div>
    </div>
  );
}
