import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Phone, Mail, Edit, CheckCircle2, Clock, AlertCircle, Key,
  User as UserIcon, MapPin, Home, Calendar, X, Save, Eye, EyeOff,
  Lock, Copy, CopyCheck, Check, Loader2, Shield, Briefcase,
  IndianRupee, Camera, FileText, Upload, ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import { tenantAPI } from "@/lib/tenantAPI";
import { Tenant, MatchedProperty } from "./types";

interface TenantProfileTabProps {
  tenant: Tenant;
  matchedProperties: MatchedProperty[];
  onUpdate?: (data: any) => void;
}

const statusConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
  "Active Search":     { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={10} /> },
  "Interested":        { bg: "bg-amber-50 text-amber-700 border-amber-200",       icon: <AlertCircle size={10} /> },
  "Agreement Signed":  { bg: "bg-purple-50 text-purple-700 border-purple-200",    icon: <Key size={10} /> },
  "Inactive":          { bg: "bg-gray-100 text-gray-600 border-gray-200",         icon: <Clock size={10} /> },
};

function fmtINR(val: number | string) {
  const n = Number(val);
  return n > 0 ? `₹${n.toLocaleString("en-IN")}` : "—";
}
function getInitials(name: string) {
  if (!name || !name.trim()) return "T";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ─── tiny read-only card ─── */
const RF = ({ label, value, icon }: { label: string; value?: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="bg-slate-50 rounded-lg border border-slate-100 px-2.5 py-2">
    <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400 flex items-center gap-1 mb-0.5">
      {icon && <span className="text-orange-400">{icon}</span>}{label}
    </div>
    <div className="text-[11px] font-bold text-slate-800 truncate">{value || "—"}</div>
  </div>
);

/* ─── form input ─── */
const FI = ({
  label, name, value, onChange, type = "text", options, placeholder, required,
}: {
  label: string; name: string; value: string | number;
  onChange: (n: string, v: string) => void;
  type?: string; options?: string[]; placeholder?: string; required?: boolean;
}) => (
  <div className="flex flex-col gap-0.5">
    <label className="text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {type === "select" && options ? (
      <select
        name={name} value={String(value ?? "")}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-orange-500 transition"
      >
        <option value="">— Select —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input
        type={type} name={name} value={String(value ?? "")} required={required}
        onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder}
        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-orange-500 transition"
      />
    )}
  </div>
);

/* ─── section header ─── */
const Sec = ({ emoji, title }: { emoji: string; title: string }) => (
  <div className="flex items-center gap-2 mb-2.5 pb-1.5 border-b border-slate-100">
    <span className="text-sm">{emoji}</span>
    <span className="text-xs font-extrabold text-slate-700">{title}</span>
  </div>
);

/* ════════════════════════════════════════════════════ */
export default function TenantProfileTab({ tenant, matchedProperties, onUpdate }: TenantProfileTabProps) {

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState<Record<string, string | number>>({});
  const [photoUploading, setPhotoUploading] = useState(false);
  const [idUploading, setIdUploading]       = useState(false);
  const [showMatchInfo, setShowMatchInfo]   = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const idRef    = useRef<HTMLInputElement>(null);

  const formatDateForInput = (d: any) => {
    if (!d) return "";
    const str = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return str.split("T")[0];
    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(str)) {
      const parts = str.split(/[-/]/);
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    try {
      const dt = new Date(str);
      if (!isNaN(dt.getTime())) {
        const yr = dt.getFullYear();
        const mo = String(dt.getMonth() + 1).padStart(2, "0");
        const da = String(dt.getDate()).padStart(2, "0");
        return `${yr}-${mo}-${da}`;
      }
    } catch {}
    return "";
  };

  const initForm = () => ({
    name:                     tenant.name                     || "",
    email:                    tenant.email                    || "",
    phone:                    tenant.phone                    || "",
    whatsapp:                 tenant.whatsapp                 || tenant.phone || "",
    tenant_type:              tenant.tenant_type              || "",
    budget_min:               tenant.budget_min               || "",
    budget_max:               tenant.budget_max               || "",
    preferred_bhk:            tenant.preferred_bhk            || "",
    preferred_location:       tenant.preferred_location       || "",
    current_address:          tenant.current_address          || "",
    move_in_date:             formatDateForInput(tenant.move_in_date),
    occupation_type:          tenant.occupation_type          || "",
    company_name:             tenant.company_name             || "",
    designation:              tenant.designation              || "",
    monthly_income:           tenant.monthly_income           || "",
    office_location:          tenant.office_location          || "",
    marital_status:           tenant.marital_status           || "",
    family_members_count:     tenant.family_members_count     || "",
    expected_stay_duration:   tenant.expected_stay_duration   || "",
    food_preference:          tenant.food_preference          || "",
    has_pets:                 tenant.has_pets                 || "",
    smoking_habits:           tenant.smoking_habits           || "",
    vehicle_type:             tenant.vehicle_type             || "",
    id_proof_type:            (tenant as any).id_proof_type   || "",
    id_proof_number:          (tenant as any).id_proof_number || "",
  });

  useEffect(() => {
    setForm((prev) => {
      // If user is actively typing in edit mode, preserve their entered changes
      if (isEditing && Object.keys(prev).length > 0) {
        return {
          ...initForm(),
          ...prev,
        };
      }
      return initForm();
    });
  }, [tenant]);

  const handleChange = (name: string, val: string) => setForm((p) => ({ ...p, [name]: val }));

  const handleSave = async () => {
    if (!form.name || !form.phone) { toast.error("Name and Phone are required"); return; }
    setSaving(true);
    try {
      if (tenant.id) {
        // calculate completion
        const checks = [
          form.name, form.phone, form.email, form.tenant_type,
          form.occupation_type, form.monthly_income, form.budget_max,
          form.preferred_bhk, form.preferred_location, form.food_preference,
          form.move_in_date, (tenant as any).id_proof_type,
        ];
        const filled = checks.filter((v) => v && String(v).trim() !== "").length;
        const pct = Math.round((filled / checks.length) * 100);
        const { profile_image, ...savePayload } = form;
        await tenantAPI.update(tenant.id, { ...savePayload, profile_completion_percentage: pct });
        onUpdate?.({ ...tenant, ...form, profile_completion_percentage: pct });
        toast.success("Profile saved!");
        setIsEditing(false);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant.id) return;
    setPhotoUploading(true);
    try {
      const res = await tenantAPI.uploadPhoto(tenant.id, file);
      if (res?.success && res?.url) {
        const photoUrl = res.url;
        setForm((prev) => ({ ...prev, profile_photo: photoUrl, profile_image: photoUrl }));
        onUpdate?.({
          ...tenant,
          ...form,
          profile_photo: photoUrl,
          profile_image: photoUrl,
        });
        toast.success("Profile photo updated!");
      }
    } catch { toast.error("Photo upload failed"); }
    finally { setPhotoUploading(false); }
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant.id) return;
    setIdUploading(true);
    try {
      const res = await tenantAPI.uploadIdProof(
        tenant.id, file,
        String(form.id_proof_type || ""),
        String(form.id_proof_number || "")
      );
      if (res?.success && res?.url) {
        const docUrl = res.url;
        setForm((prev) => ({ ...prev, id_proof_document: docUrl }));
        onUpdate?.({
          ...tenant,
          ...form,
          id_proof_document: docUrl,
        });
        toast.success("ID proof uploaded!");
      }
    } catch { toast.error("ID proof upload failed"); }
    finally { setIdUploading(false); }
  };

  /* profile completion */
  const profileCompletion = useMemo(() => {
    const checks = [
      { label: "Full Name",         val: tenant.name },
      { label: "Phone",             val: tenant.phone },
      { label: "Email",             val: tenant.email },
      { label: "Tenant Type",       val: tenant.tenant_type },
      { label: "Occupation",        val: tenant.occupation_type },
      { label: "Monthly Income",    val: tenant.monthly_income },
      { label: "Budget Range",      val: tenant.budget_max },
      { label: "Preferred BHK",     val: tenant.preferred_bhk },
      { label: "Location",          val: tenant.preferred_location },
      { label: "Food Preference",   val: tenant.food_preference },
      { label: "Move-in Date",      val: tenant.move_in_date },
      { label: "ID Proof",          val: (tenant as any).id_proof_type },
      { label: "Profile Photo",     val: (tenant as any).profile_photo },
    ];
    const filled = checks.filter((c) => c.val && String(c.val).trim() !== "");
    const pct = Math.round((filled.length / checks.length) * 100);
    return { percent: pct, missing: checks.filter((c) => !c.val || String(c.val).trim() === "").map((c) => c.label) };
  }, [tenant]);

  const statusInfo = statusConfig[tenant.status] ?? statusConfig["Inactive"];
  const budgetMin  = Number(tenant.budget_min) || 0;
  const budgetMax  = Number(tenant.budget_max) || 0;
  const profilePhoto = (tenant as any).profile_photo;

  /* password */
  const [pw, setPw]             = useState("");
  const [cpw, setCpw]           = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [updPw, setUpdPw]       = useState(false);
  const [copied, setCopied]     = useState(false);

  const username = useMemo(() => {
    if (tenant.username) return tenant.username;
    if (!tenant.name) return "tenant";
    const parts = tenant.name.trim().split(/\s+/);
    const f = parts[0] || "tenant";
    const l = parts.slice(1).join("");
    return l ? `${f[0].toLowerCase()}${l.toLowerCase().replace(/[^a-z0-9]/g, "")}` : f.toLowerCase().replace(/[^a-z0-9]/g, "");
  }, [tenant.username, tenant.name]);

  const handlePwUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || pw.length < 6) { toast.error("Min 6 characters"); return; }
    if (pw !== cpw) { toast.error("Passwords don't match"); return; }
    setUpdPw(true);
    try {
      const res = await tenantAPI.updatePassword({ email: tenant.email, tenant_id: tenant.id, new_password: pw });
      if (res?.success) { toast.success("Password updated!"); setPw(""); setCpw(""); }
      else toast.error(res?.message || "Failed");
    } catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
    finally { setUpdPw(false); }
  };

  /* ════════ RENDER ════════ */
  return (
    <div className="space-y-2.5">

      {/* ── Completion Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-3.5 border border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-orange-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Profile Completeness</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                  profileCompletion.percent >= 80 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : profileCompletion.percent >= 50 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}>{profileCompletion.percent}%</span>
              </div>
              {profileCompletion.missing.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Missing: <span className="text-orange-300">{profileCompletion.missing.join(", ")}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowMatchInfo(!showMatchInfo)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-orange-300 font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
            >
              <span>{showMatchInfo ? 'Hide Score Logic' : '🎯 How Match % Works'}</span>
            </button>
            <div className="w-28 shrink-0 hidden sm:block">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  profileCompletion.percent >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : profileCompletion.percent >= 50 ? "bg-gradient-to-r from-amber-500 to-orange-400"
                  : "bg-gradient-to-r from-rose-500 to-orange-500"
                }`} style={{ width: `${profileCompletion.percent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Match Score Calculation Breakdown Info Box */}
      {showMatchInfo && (
        <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-slate-50 rounded-xl p-3.5 border border-orange-200/80 shadow-xs animate-in fade-in slide-in-from-top-1 duration-150 space-y-2.5">
          <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-orange-500 text-white font-black text-[11px]">🎯</span>
              <div>
                <h4 className="text-xs font-black text-slate-900">Multi-Factor Match Score Algorithm (0–100%)</h4>
                <p className="text-[10px] text-slate-600">Why does a property show 60% or 90% Match? Here is the exact breakdown:</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-black text-[9.5px]">
              7 Precision Metrics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="p-2 rounded-lg bg-white border border-orange-100 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800">💰 Budget Match</span>
                <span className="text-[10px] font-black text-orange-600">25% Max</span>
              </div>
              <p className="text-[9.5px] text-slate-500">Rent within ₹{fmtINR(tenant.budget_min)} – ₹{fmtINR(tenant.budget_max)}.</p>
              <span className={`text-[9px] font-bold ${tenant.budget_max ? 'text-emerald-600' : 'text-amber-600'}`}>
                {tenant.budget_max ? '✓ Configured' : '⚠ Defaults to 15%'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-orange-100 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800">👥 Tenant Type</span>
                <span className="text-[10px] font-black text-orange-600">20% Max</span>
              </div>
              <p className="text-[9.5px] text-slate-500">Family / Bachelor vs Owner preferred tenant.</p>
              <span className={`text-[9px] font-bold ${tenant.tenant_type ? 'text-emerald-600' : 'text-amber-600'}`}>
                {tenant.tenant_type ? `✓ ${tenant.tenant_type}` : '⚠ Defaults to 20% (Any)'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-orange-100 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800">📍 Preferred Location</span>
                <span className="text-[10px] font-black text-orange-600">15% Max</span>
              </div>
              <p className="text-[9.5px] text-slate-500">Property locality matches {tenant.preferred_location || 'locality'}.</p>
              <span className={`text-[9px] font-bold ${tenant.preferred_location ? 'text-emerald-600' : 'text-amber-600'}`}>
                {tenant.preferred_location ? '✓ Specified' : '⚠ Defaults to 10%'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-orange-100 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800">🏠 BHK Configuration</span>
                <span className="text-[10px] font-black text-orange-600">15% Max</span>
              </div>
              <p className="text-[9.5px] text-slate-500">1BHK, 2BHK, 3BHK matches exact property type.</p>
              <span className={`text-[9px] font-bold ${tenant.preferred_bhk ? 'text-emerald-600' : 'text-amber-600'}`}>
                {tenant.preferred_bhk ? `✓ ${tenant.preferred_bhk}` : '⚠ Defaults to 10%'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-orange-100 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800">📅 Move-in Date</span>
                <span className="text-[10px] font-black text-orange-600">10% Max</span>
              </div>
              <p className="text-[9.5px] text-slate-500">Desired move-in date aligns with property availability.</p>
              <span className={`text-[9px] font-bold ${tenant.move_in_date ? 'text-emerald-600' : 'text-amber-600'}`}>
                {tenant.move_in_date ? '✓ Set' : '⚠ Defaults to 8%'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-orange-100 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800">🥗 Food Preference</span>
                <span className="text-[10px] font-black text-orange-600">10% Max</span>
              </div>
              <p className="text-[9.5px] text-slate-500">Veg / Non-veg rules compatibility.</p>
              <span className={`text-[9px] font-bold ${tenant.food_preference ? 'text-emerald-600' : 'text-amber-600'}`}>
                {tenant.food_preference ? `✓ ${tenant.food_preference}` : '⚠ Defaults to 10%'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-orange-100 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800">🐾 Pet Policy</span>
                <span className="text-[10px] font-black text-orange-600">5% Max</span>
              </div>
              <p className="text-[9.5px] text-slate-500">Pet allowances and owner pet friendly status.</p>
              <span className="text-[9px] font-bold text-emerald-600">
                {tenant.has_pets === 'yes' ? 'Pet Owner' : 'Standard (5%)'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-orange-500 text-white space-y-0.5 flex flex-col justify-center">
              <div className="font-extrabold text-[11px]">💡 Pro-Tip</div>
              <p className="text-[9.5px] text-orange-100 leading-tight">
                Fill in all 7 preference fields to reach 95%+ high accuracy matches on your dashboard!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border-b border-orange-100">
          <div className="flex items-center gap-3">
            {/* Avatar with upload */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                {profilePhoto
                  ? <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
                  : (tenant.name ? getInitials(tenant.name) : <UserIcon size={22} />)}
              </div>
              <button
                onClick={() => photoRef.current?.click()}
                disabled={photoUploading}
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow hover:bg-orange-600 transition cursor-pointer"
                title="Upload photo"
              >
                {photoUploading ? <Loader2 size={9} className="animate-spin" /> : <Camera size={9} />}
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 truncate">{tenant.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{tenant.email || "No email"}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => { setForm(initForm()); setIsEditing(false); }}
                        className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 text-[10px] font-medium flex items-center gap-1">
                        <X size={11} /> Cancel
                      </button>
                      <button onClick={handleSave} disabled={saving}
                        className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold flex items-center gap-1 shadow disabled:opacity-60">
                        {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 text-[10px] font-medium flex items-center gap-1">
                      <Edit size={11} /> Edit Profile
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border gap-1 ${statusInfo.bg}`}>
                  {statusInfo.icon}<span>{tenant.status}</span>
                </span>
                {tenant.tenant_id && <span className="text-[9px] text-gray-400 font-semibold">#{tenant.tenant_id}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ══ EDIT MODE ══ */}
        {isEditing ? (
          <div className="px-4 py-4 space-y-5">

            {/* Basic Info */}
            <div>
              <Sec emoji="👤" title="Basic Information" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <FI label="Full Name"          name="name"               value={form.name}               onChange={handleChange} required />
                <FI label="Email"              name="email"              value={form.email}              onChange={handleChange} type="email" />
                <FI label="Phone"              name="phone"              value={form.phone}              onChange={handleChange} required />
                <FI label="WhatsApp"           name="whatsapp"           value={form.whatsapp}           onChange={handleChange} />
                <FI label="Tenant Type"        name="tenant_type"        value={form.tenant_type}        onChange={handleChange} type="select"
                  options={["Family","Bachelor Male","Bachelor Female","Company Lease","Student"]} />
                <FI label="Preferred BHK"      name="preferred_bhk"      value={form.preferred_bhk}      onChange={handleChange} type="select"
                  options={["1 RK","1 BHK","2 BHK","3 BHK","4 BHK","Any"]} />
                <FI label="Budget Min (₹)"     name="budget_min"         value={form.budget_min}         onChange={handleChange} type="number" placeholder="15000" />
                <FI label="Budget Max (₹)"     name="budget_max"         value={form.budget_max}         onChange={handleChange} type="number" placeholder="30000" />
                <FI label="Preferred Location" name="preferred_location" value={form.preferred_location} onChange={handleChange} placeholder="Wakad, Hinjewadi" />
                <FI label="Current Address"    name="current_address"    value={form.current_address}    onChange={handleChange} placeholder="City / Locality" />
                <FI label="Move-In Date"       name="move_in_date"       value={form.move_in_date}       onChange={handleChange} type="date" />
              </div>
            </div>

            {/* Employment */}
            <div>
              <Sec emoji="💼" title="Occupancy & Employment" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <FI label="Occupation Type"     name="occupation_type"        value={form.occupation_type}        onChange={handleChange} type="select"
                  options={["Salaried","Self-Employed","Business","Student","Other"]} />
                <FI label="Company Name"        name="company_name"           value={form.company_name}           onChange={handleChange} placeholder="Infosys, Google" />
                <FI label="Designation"         name="designation"            value={form.designation}            onChange={handleChange} placeholder="Software Engineer" />
                <FI label="Monthly Income (₹)"  name="monthly_income"         value={form.monthly_income}         onChange={handleChange} type="number" placeholder="75000" />
                <FI label="Office Location"     name="office_location"        value={form.office_location}        onChange={handleChange} placeholder="Phase 1, Hinjewadi" />
                <FI label="Marital Status"      name="marital_status"         value={form.marital_status}         onChange={handleChange} type="select"
                  options={["Single","Married","Other"]} />
                <FI label="Family Members"      name="family_members_count"   value={form.family_members_count}   onChange={handleChange} type="number" placeholder="1" />
                <FI label="Expected Stay"       name="expected_stay_duration" value={form.expected_stay_duration} onChange={handleChange} type="select"
                  options={["11 Months","1 - 2 Years","2+ Years","Long Term"]} />
              </div>
            </div>

            {/* Lifestyle */}
            <div>
              <Sec emoji="🥗" title="Lifestyle & Preferences" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <FI label="Food Habit"    name="food_preference" value={form.food_preference} onChange={handleChange} type="select" options={["Veg Only","Veg/Non-Veg","Any"]} />
                <FI label="Has Pets?"    name="has_pets"         value={form.has_pets}        onChange={handleChange} type="select" options={["No","Yes"]} />
                <FI label="Smoking"      name="smoking_habits"   value={form.smoking_habits}  onChange={handleChange} type="select" options={["No","Occasionally","Yes"]} />
                <FI label="Vehicle"      name="vehicle_type"     value={form.vehicle_type}    onChange={handleChange} type="select" options={["None","2-Wheeler","4-Wheeler","Both"]} />
              </div>
            </div>

            {/* ID Proof */}
            <div>
              <Sec emoji="🪪" title="Identity Proof" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <FI label="ID Proof Type"   name="id_proof_type"   value={form.id_proof_type}   onChange={handleChange} type="select"
                  options={["Aadhaar Card","PAN Card","Passport","Driving License","Voter ID"]} />
                <FI label="ID Proof Number" name="id_proof_number" value={form.id_proof_number} onChange={handleChange} placeholder="XXXX XXXX XXXX" />
                {/* Document Upload */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9.5px] font-bold uppercase tracking-wide text-gray-500">ID Document (PDF / Image)</label>
                  {(tenant as any).id_proof_document ? (
                    <div className="flex items-center gap-1.5">
                      <a href={(tenant as any).id_proof_document} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 transition">
                        <ExternalLink size={11} /> View Uploaded
                      </a>
                      <button onClick={() => idRef.current?.click()} disabled={idUploading}
                        className="px-2 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold hover:bg-orange-100 transition cursor-pointer">
                        {idUploading ? <Loader2 size={11} className="animate-spin" /> : "Replace"}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => idRef.current?.click()} disabled={idUploading}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 hover:border-orange-400 text-slate-600 hover:text-orange-600 text-[10px] font-bold transition cursor-pointer">
                      {idUploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                      {idUploading ? "Uploading..." : "Upload Document"}
                    </button>
                  )}
                  <input ref={idRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleIdUpload} />
                </div>
              </div>
            </div>

            {/* Save Bar */}
            <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
              <button onClick={() => { setForm(initForm()); setIsEditing(false); }}
                className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5">
                <X size={12} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow disabled:opacity-60">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

        ) : (
          /* ══ READ MODE ══ */
          <div className="divide-y divide-slate-100">

            {/* Quick Info 2x4 */}
            <div className="px-3 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <RF label="Phone"            value={tenant.phone}                                                    icon={<Phone size={10} />} />
              <RF label="WhatsApp"         value={tenant.whatsapp || tenant.phone}                                  icon={<Phone size={10} />} />
              <RF label="Budget (Min–Max)" value={budgetMin || budgetMax ? `${fmtINR(budgetMin)} – ${fmtINR(budgetMax)}` : null} icon={<IndianRupee size={10} />} />
              <RF label="Preferred BHK"    value={tenant.preferred_bhk || null}                                     icon={<Home size={10} />} />
              <RF label="Tenant Type"      value={tenant.tenant_type || null}                                       icon={<UserIcon size={10} />} />
              <RF label="Move-In Date"     value={tenant.move_in_date || null}                                      icon={<Calendar size={10} />} />
              <RF label="Location"         value={tenant.preferred_location || null}                                icon={<MapPin size={10} />} />
              <RF label="Current Address"  value={tenant.current_address || null}                                   icon={<MapPin size={10} />} />
            </div>

            {/* Employment */}
            <div className="px-3 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">💼</span>
                <span className="text-[11px] font-extrabold text-slate-700">Occupancy & Employment</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <RF label="Occupation"       value={tenant.occupation_type || null} />
                <RF label="Company"          value={tenant.company_name || null} />
                <RF label="Designation"      value={tenant.designation || null} />
                <RF label="Monthly Income"   value={tenant.monthly_income ? fmtINR(tenant.monthly_income) : null} />
                <RF label="Office Location"  value={tenant.office_location || null} />
                <RF label="Marital Status"   value={tenant.marital_status || null} />
                <RF label="Family Members"   value={tenant.family_members_count ? `${tenant.family_members_count} Member(s)` : null} />
                <RF label="Expected Stay"    value={tenant.expected_stay_duration || null} />
              </div>
            </div>

            {/* Lifestyle */}
            <div className="px-3 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">🥗</span>
                <span className="text-[11px] font-extrabold text-slate-700">Lifestyle & Preferences</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <RF label="Food"    value={tenant.food_preference || null} />
                <RF label="Pets"    value={tenant.has_pets || null} />
                <RF label="Smoking" value={tenant.smoking_habits || null} />
                <RF label="Vehicle" value={tenant.vehicle_type || null} />
              </div>
            </div>

            {/* ID Proof */}
            <div className="px-3 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">🪪</span>
                <span className="text-[11px] font-extrabold text-slate-700">Identity Proof</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <RF label="ID Type"   value={(tenant as any).id_proof_type || null}   icon={<FileText size={10} />} />
                <RF label="ID Number" value={(tenant as any).id_proof_number ? "••••••••••" : null} icon={<Key size={10} />} />
                <div className="col-span-2 bg-slate-50 rounded-lg border border-slate-100 px-2.5 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">ID Document</div>
                  {(tenant as any).id_proof_document ? (
                    <a href={(tenant as any).id_proof_document} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline">
                      <ExternalLink size={11} /> View Document
                    </a>
                  ) : (
                    <span className="text-[11px] text-gray-400">Not uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Credentials & Password ── */}
        <div className="border-t border-gray-100 px-3 py-3 space-y-2.5 bg-slate-50/50">
          <div className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
            <Key size={13} className="text-orange-500" /> Account Credentials
          </div>

          {/* Username */}
          <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-white border border-orange-200/80">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">@</div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-gray-500 block uppercase tracking-wider">Username</span>
                <span className="font-mono font-bold text-xs text-orange-600 truncate block">@{username}</span>
              </div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(username); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px] border border-orange-200 transition cursor-pointer">
              {copied ? <CopyCheck size={11} className="text-emerald-600" /> : <Copy size={11} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Password Form */}
          <form onSubmit={handlePwUpdate} className="bg-white p-2.5 rounded-lg border border-gray-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1"><Lock size={11} className="text-gray-400" /> Update Password</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <input type={showPw ? "text" : "password"} required minLength={6} placeholder="New password (min 6)" value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full px-2.5 py-1.5 pr-8 bg-slate-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-orange-500 transition" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
              <input type={showPw ? "text" : "password"} required minLength={6} placeholder="Confirm password" value={cpw}
                onChange={(e) => setCpw(e.target.value)}
                className={`w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg text-xs font-medium outline-none transition ${
                  cpw.length > 0 ? pw === cpw ? "border-emerald-400" : "border-rose-400" : "border-gray-200 focus:border-orange-500"}`} />
            </div>
            {cpw.length > 0 && (
              <p className={`text-[10px] font-bold ${pw === cpw ? "text-emerald-600" : "text-rose-600"}`}>
                {pw === cpw ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={updPw || !pw}
                className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
                {updPw ? <><Loader2 size={11} className="animate-spin" /> Updating...</> : <><Check size={11} /> Set Password</>}
              </button>
            </div>
          </form>
        </div>

        {/* ── Actions ── */}
        <div className="border-t border-gray-100 px-3 py-2.5 flex gap-2">
          <button onClick={() => { if (tenant.phone) window.location.href = `tel:${tenant.phone.replace(/\D/g, "")}`; }}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium flex items-center gap-1.5 transition">
            <Phone size={11} />Call
          </button>
          <button onClick={() => { const n = (tenant.whatsapp || tenant.phone || "").replace(/\D/g, ""); if (n) window.open(`https://wa.me/${n}`, "_blank"); }}
            className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium flex items-center gap-1.5 transition">
            <Phone size={11} />WhatsApp
          </button>
          <button onClick={() => { if (tenant.email) window.location.href = `mailto:${tenant.email}`; }}
            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5 transition">
            <Mail size={11} />Email
          </button>
        </div>
      </div>
    </div>
  );
}
