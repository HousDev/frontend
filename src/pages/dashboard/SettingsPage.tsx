


// src/pages/dashboard/SettingsPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Settings,
  User,
  Shield,
  Database,
  Zap,
  Download,
  Upload,
  Bell,
  Mail,
  Smartphone,
  Globe,
  Lock,
  Palette,
  Users,
  Building,
  ArrowRight,
  Save,
  RotateCcw,
  Camera,
  Star,
  CheckCircle,
  X,
  Key,
  LogOut,
  Clock,
  Timer,
  Activity,
  ShieldAlert,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { usersAPI } from "@/lib/api";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { masterDataAPI } from "@/lib/mastersAPI";
import systemSettingsAPI from "@/lib/systemSettingsAPI";
import { toast } from "react-toastify";

// Brand: navy #1a3a5c  orange #e87722

interface UserProfile {
  id: string;
  username?: string;
  dob?: string | null;
  email?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  designation?: string;
  department?: string;
  role?: string;
  timezone: string;
  language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  [k: string]: any;
}

interface SystemSettings {
  company_name: string;
  currency: string;
  date_format: string;
  time_format: string;
  default_language: string;
  max_file_size: number;
  backup_frequency: string;
  primary_color: string;
  secondary_color: string;
  company_logo?: string | null;
  company_favicon?: string | null;
  footer_logo?: string | null;
  auto_assign_leads?: boolean;
  lead_scoring_enabled?: boolean;
  property_auto_approval?: boolean;
  inactivity_timeout_minutes?: number;
  enable_inactivity_logout?: boolean;
  enable_guest_property_limit?: boolean;
  guest_property_view_limit?: number;
  [k: string]: any;
}

const normalizeDOB = (dob: string | null | undefined) => {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const {
    systemSettings,
    loading: systemLoading,
    updateSystemSettings,
    saveSystemSettings,
  } = (useSystemSettings() as unknown) as {
    systemSettings: SystemSettings;
    loading: boolean;
    updateSystemSettings: (patch: Partial<SystemSettings>) => void;
    saveSystemSettings: () => Promise<any>;
  };

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "system" | "security" | "auth_settings"
  >("profile");
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [masterOptions, setMasterOptions] = useState({
    roles: [] as { value: string; label: string }[],
    departments: [] as { value: string; label: string }[],
  });

  useEffect(() => {
    fetchUserProfile();
    fetchMasterData();
  }, []);

  const formatDOBForMySQL = (dob: string | null | undefined) => {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchMasterData = async () => {
    try {
      const commonMasterTypes: any[] = await masterDataAPI.getAllMasterTypes("common");
      const masterValues = await Promise.all(
        commonMasterTypes.map((masterType: any) => masterDataAPI.getMasterValues(masterType.id))
      );
      const organizedData: Record<string, { value: string; label: string }[]> = {};
      commonMasterTypes.forEach((masterType: any, index: number) => {
        const values = masterValues[index] || [];
        const data = values.map((item: any) => ({
          value: String(item.id),
          label: item.value || item.name || "Unknown",
        }));
        organizedData[(masterType.name || "").toLowerCase()] = data;
      });
      setMasterOptions({
        roles: organizedData["role"] || [],
        departments: organizedData["department"] || [],
      });
    } catch (error) {
      console.error("Failed to load master data:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response: any = await usersAPI.getProfile();
      if (response?.success) {
        const p: UserProfile = {
          ...response.data,
          id: String(response.data.id ?? ""),
          dob: normalizeDOB(response.data.dob),
          email: response.data.email ?? "",
          first_name: response.data.first_name ?? "",
          last_name: response.data.last_name ?? "",
          phone: response.data.phone ?? "",
          avatar: response.data.avatar ?? undefined,
          designation: response.data.designation ?? "",
          department: response.data.department ?? "",
          role: response.data.role ?? "",
          timezone: response.data.timezone ?? "UTC",
          language: response.data.language ?? "en",
          email_notifications: !!response.data.email_notifications,
          sms_notifications: !!response.data.sms_notifications,
          push_notifications: !!response.data.push_notifications,
        };
        setProfile(p);
      } else {
        if (response?.data) setProfile(response.data as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      const payload = { ...profile };
      if (payload.dob) payload.dob = formatDOBForMySQL(payload.dob);
      const response: any = await usersAPI.updateProfile(payload);
      if (response?.success) {
        toast.success("Profile updated successfully");
        setProfile({ ...profile, ...response.data });
        updateUser({
          first_name: response.data.first_name || user?.first_name,
          last_name: response.data.last_name || user?.last_name,
          role: response.data.role || user?.role,
          avatar: response.data.avatar || (user as any)?.avatar,
        });
      } else {
        toast.error(response?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) { toast.error("Please upload a valid image file (JPG, PNG, GIF)"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File size must be less than 5MB"); return; }
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);
      const response: any = await usersAPI.uploadAvatar(formData);
      if (response?.success) {
        const updatedProfile = { ...profile!, avatar: `${response.data.avatar}?t=${Date.now()}` };
        setProfile(updatedProfile);
        updateUser({ avatar: updatedProfile.avatar } as Partial<typeof user>);
        toast.success("Profile picture updated successfully");
      } else {
        toast.error(response?.message || "Failed to upload profile picture");
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error?.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!profile?.avatar) return;
    try {
      setUploadingAvatar(true);
      const response: any = await usersAPI.removeAvatar();
      if (response?.success) {
        const updatedProfile = { ...profile, avatar: undefined };
        setProfile(updatedProfile);
        updateUser({ avatar: undefined } as Partial<typeof user>);
        toast.success("Profile picture removed successfully");
      } else {
        toast.error(response?.message || "Failed to remove profile picture");
      }
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      toast.error(error?.response?.data?.message || "Failed to remove profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) { toast.error("Passwords do not match"); return; }
    try {
      setSaving(true);
      const resp: any = await usersAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      if (resp?.success) {
        toast.success("Password changed successfully");
        setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
      } else {
        toast.error(resp?.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error?.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleSystemSettingsUpdate = async () => {
    if (!systemSettings) return;
    try {
      setSaving(true);
      await saveSystemSettings();
    } catch (error: any) {
      console.error("Error updating system settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: "company_logo" | "company_favicon" | "footer_logo") => {
    if (!systemSettings) return;
    try {
      const formData = new FormData();
      formData.append(type, file);
      Object.keys(systemSettings).forEach((key) => {
        if (key === type) return;
        const val = systemSettings[key];
        if (val !== undefined && val !== null && typeof val !== "object") formData.append(key, String(val));
      });
      const data: any = await systemSettingsAPI.saveSettings(formData);
      if (data?.success) {
        updateSystemSettings({ [type]: `${data.data[type]}?t=${Date.now()}` } as Partial<SystemSettings>);
        const msgs = { company_logo: "Company logo updated", company_favicon: "Favicon updated", footer_logo: "Footer logo updated" };
        toast.success(msgs[type]);
      } else {
        toast.error(data?.message || "File upload failed");
      }
    } catch (err) {
      console.error("File upload error:", err);
      toast.error("Error uploading file");
    }
  };

  const handleFileRemove = async (type: "company_logo" | "company_favicon" | "footer_logo") => {
    try {
      const formData = new FormData();
      const removeKeys = { company_logo: "remove_logo", company_favicon: "remove_favicon", footer_logo: "remove_footer_logo" };
      formData.append(removeKeys[type], "true");
      const data: any = await systemSettingsAPI.saveSettings(formData);
      if (data?.success) {
        updateSystemSettings({ [type]: null } as Partial<SystemSettings>);
        const msgs = { company_logo: "Company logo removed", company_favicon: "Favicon removed", footer_logo: "Footer logo removed" };
        toast.info(msgs[type]);
      } else {
        toast.error(data?.message || "Failed to remove file");
      }
    } catch (err) {
      console.error("Error removing file:", err);
      toast.error("Error removing file");
    }
  };

  if (loading || systemLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-gray-500 text-sm font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  const quickLinks = [
    { title: "Master Data", description: "Manage system data", icon: Database, color: "bg-blue-500", href: "/dashboard/settings/master-data" },
    { title: "Import/Export", description: "Data import & export", icon: Download, color: "bg-emerald-500", href: "/dashboard/settings/import-export" },
    { title: "AI Settings", description: "Configure AI features", icon: Zap, color: "bg-purple-500", href: "/dashboard/settings/ai-settings" },
    { title: "User Management", description: "Manage users & permissions", icon: Users, color: "bg-orange-500", href: "/dashboard/users" },
  ] as const;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    ...(user?.role === "admin"
      ? [
          { id: "auth_settings" as const, label: "Login / Logout", icon: LogOut },
          { id: "system" as const, label: "System", icon: Settings },
        ]
      : []),
  ];

  // ── Shared input classes ──
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e87722]/40 focus:border-[#e87722] transition-colors bg-white";
  const selectCls = `${inputCls} appearance-none cursor-pointer`;
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  // ── Upload box helper ──
  const UploadBox = ({ imageUrl, alt, uploadId, onUpload, onRemove, hint }: {
    imageUrl?: string | null; alt: string; uploadId: string;
    onUpload: (f: File) => void; onRemove: () => void; hint: string;
  }) => (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:border-[#e87722]/50 transition-colors">
      {imageUrl ? (
        <div className="space-y-2">
          <img src={imageUrl} alt={alt} className="h-10 w-auto mx-auto object-contain" />
          <div className="flex justify-center gap-2">
            <input id={uploadId} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} className="hidden" />
            <label htmlFor={uploadId} className="cursor-pointer text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors">Change</label>
            <button onClick={onRemove} className="text-[10px] font-medium bg-red-50 text-red-500 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors">Remove</button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Upload className="h-4 w-4 text-gray-300 mx-auto" />
          <input id={`${uploadId}-empty`} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} className="hidden" />
          <label htmlFor={`${uploadId}-empty`} className="cursor-pointer text-[10px] font-medium bg-[#e87722]/10 text-[#e87722] px-2 py-1 rounded-lg hover:bg-[#e87722]/20 inline-block transition-colors">Upload</label>
          <p className="text-[10px] text-gray-400">{hint}</p>
        </div>
      )}
    </div>
  );

  return (
<div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 overflow-y-auto">     
   <div className="max-w-7xl mx-auto space-y-4">

        {/* ── Page Header ── */}
        <div className="bg-[#1a3a5c] rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #e87722 0%, transparent 50%), radial-gradient(circle at 80% 20%, #e87722 0%, transparent 40%)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e87722] rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Settings</h1>
                <p className="text-xs text-white/60">Manage your account and system preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link to="/dashboard/settings/roles-permissions">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium rounded-lg transition-colors">
                  <Shield className="h-3.5 w-3.5 text-[#e87722]" />
                  Roles &amp; Permissions
                </button>
              </Link>
              <Link to="/dashboard/settings/integrations">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium rounded-lg transition-colors">
                  <Zap className="h-3.5 w-3.5 text-[#e87722]" />
                  Integrations
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {quickLinks.map((link, i) => (
            <Link key={i} to={link.href} className="group bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-[#e87722]/40 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 ${link.color} rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                  <link.icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-[#1a3a5c] group-hover:text-[#e87722] transition-colors truncate">{link.title}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate hidden sm:block">{link.description}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-[#e87722] transition-all shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Tabs */}
          <div className="border-b border-gray-200 px-3 sm:px-6 overflow-x-auto">
            <nav className="flex gap-0 whitespace-nowrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 sm:px-5 py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all shrink-0 ${
                    activeTab === tab.id
                      ? "border-[#e87722] text-[#e87722]"
                      : "border-transparent text-gray-500 hover:text-[#1a3a5c] hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">

            {/* ══ PROFILE TAB ══ */}
          {activeTab === "profile" && profile && (
  <div className="space-y-5">
    {/* Avatar + info - Mobile mein bhi side by side */}
    <div className="flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="relative shrink-0">
        <div className="w-28 h-28 bg-[#1a3a5c] rounded-2xl flex items-center justify-center overflow-hidden shadow-md">
          {profile.avatar ? (
            <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" key={profile.avatar} />
          ) : (
            <User className="h-10 w-10 text-white/60" />
          )}
          {uploadingAvatar && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
        {/* Quick change overlay */}
        <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#e87722] rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[#d06a1a] transition-colors">
          <Camera className="h-3.5 w-3.5 text-white" />
          <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} className="sr-only" disabled={uploadingAvatar} />
        </label>
      </div>

      {/* Text content - Mobile mein bhi right side */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base sm:text-lg font-bold text-[#1a3a5c]">Profile Information</h3>
        <p className="text-xs text-gray-400 mt-0.5">Keep your personal details up to date</p>
        
        {/* Buttons - Mobile mein bhi ek hi row mein */}
        <div className="flex flex-row items-center gap-2 mt-3">
          <label className="cursor-pointer flex-1 sm:flex-none">
            <span className="flex items-center justify-center gap-1.5 bg-[#1a3a5c]/8 hover:bg-[#1a3a5c]/15 text-[#1a3a5c] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#1a3a5c]/20 w-full sm:w-auto">
              <Upload className="h-3.5 w-3.5" />
              {uploadingAvatar ? "Uploading…" : "Upload Photo"}
            </span>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} className="hidden" disabled={uploadingAvatar} />
          </label>
          {profile.avatar && (
            <button onClick={handleAvatarRemove} disabled={uploadingAvatar} className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-red-100 flex-1 sm:flex-none">
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">JPG, PNG, GIF · max 5MB · min 200×200px</p>
      </div>
    </div>

    {/* Form grid - 2 columns on mobile, 4 columns on desktop */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {[
        { label: "First Name", value: profile.first_name ?? "", key: "first_name", type: "text", placeholder: "John" },
        { label: "Last Name", value: profile.last_name ?? "", key: "last_name", type: "text", placeholder: "Doe" },
        { label: "Email", value: profile.email ?? "", key: "email", type: "email", placeholder: "you@example.com", readOnly: true },
        { label: "Phone", value: profile.phone ?? "", key: "phone", type: "tel", placeholder: "+91 98765 43210" },
        { label: "Designation", value: profile.designation ?? "", key: "designation", type: "text", placeholder: "Product Manager" },
      ].map((field) => (
        <div key={field.key}>
          <label className={labelCls}>{field.label}</label>
          <input
            type={field.type}
            value={field.value}
            readOnly={field.readOnly}
            placeholder={field.placeholder}
            onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
            className={`${inputCls} ${field.readOnly ? "opacity-60 cursor-not-allowed bg-gray-50" : ""}`}
          />
        </div>
      ))}

      <div>
        <label className={labelCls}>Department</label>
        <select
          value={masterOptions.departments.find((d) => d.label === profile.department)?.value || ""}
          onChange={(e) => setProfile({ ...profile, department: masterOptions.departments.find((d) => d.value === e.target.value)?.label || "" })}
          className={selectCls}
        >
          <option value="">Select Department</option>
          {masterOptions.departments.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>Date of Birth</label>
        <input type="date" value={profile?.dob ?? ""} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Role</label>
        <select
          value={masterOptions.roles.find((r) => r.label === profile.role)?.value || ""}
          onChange={(e) => setProfile({ ...profile, role: masterOptions.roles.find((r) => r.value === e.target.value)?.label || "" })}
          className={selectCls}
        >
          <option value="">Select Role</option>
          {masterOptions.roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>Timezone</label>
        <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} className={selectCls}>
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Asia/Kolkata">India Standard Time</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Language</label>
        <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })} className={selectCls}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
    </div>

    {/* Actions */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
      <div className="flex gap-2">
        <button onClick={handleProfileUpdate} disabled={saving || uploadingAvatar} className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors">
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button onClick={() => { fetchUserProfile(); fetchMasterData(); }} disabled={saving || uploadingAvatar} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
      <p className="text-[10px] text-gray-400">Email cannot be changed here — contact admin.</p>
    </div>
  </div>
)}

            {/* ══ NOTIFICATIONS TAB ══ */}
            {activeTab === "notifications" && profile && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#1a3a5c]">Notification Preferences</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Choose how you want to receive notifications</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: Mail, title: "Email Notifications", description: "Receive notifications via email", checked: profile.email_notifications, key: "email_notifications", accent: "text-blue-500", bg: "bg-blue-50" },
                    { icon: Smartphone, title: "SMS Notifications", description: "Receive notifications via SMS", checked: profile.sms_notifications, key: "sms_notifications", accent: "text-emerald-500", bg: "bg-emerald-50" },
                    { icon: Bell, title: "Push Notifications", description: "Receive browser push notifications", checked: profile.push_notifications, key: "push_notifications", accent: "text-purple-500", bg: "bg-purple-50" },
                  ].map((n) => (
                    <div key={n.key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${n.bg} rounded-lg flex items-center justify-center shrink-0`}>
                          <n.icon className={`h-4 w-4 ${n.accent}`} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                          <p className="text-[10px] text-gray-400">{n.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                        <input type="checkbox" checked={n.checked} onChange={(e) => setProfile({ ...profile, [n.key]: e.target.checked })} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#e87722] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button onClick={handleProfileUpdate} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors">
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Saving…" : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}

            {/* ══ SECURITY TAB ══ */}
            {activeTab === "security" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#1a3a5c]">Security Settings</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Manage your password and security preferences</p>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Security Tip</p>
                    <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <h4 className="text-sm font-bold text-[#1a3a5c] mb-3 flex items-center gap-2">
                    <Key className="h-4 w-4 text-[#e87722]" />
                    Change Password
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Current Password", key: "current_password", placeholder: "Enter current password" },
                      { label: "New Password", key: "new_password", placeholder: "Enter new password" },
                      { label: "Confirm New Password", key: "confirm_password", placeholder: "Confirm new password" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className={labelCls}>{f.label}</label>
                        <input
                          type="password"
                          value={passwordData[f.key as keyof typeof passwordData]}
                          onChange={(e) => setPasswordData({ ...passwordData, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    {saving ? "Changing…" : "Change Password"}
                  </button>
                </div>
              </div>
            )}

            {/* ══ LOGIN & LOGOUT SETTINGS TAB ══ */}
            {activeTab === "auth_settings" && user?.role === "admin" && systemSettings && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#1a3a5c] flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-[#e87722]" />
                    Login &amp; Logout Settings
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure session timeouts, automatic inactivity logout rules, and authentication security.
                  </p>
                </div>

                {/* Status banner */}
                <div className="flex items-start gap-3 p-4 bg-blue-50/80 border border-blue-200/80 rounded-xl">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-blue-900">
                      Active Inactivity Policy:{" "}
                      <span className="text-[#e87722]">
                        {systemSettings.enable_inactivity_logout !== false
                          ? `${systemSettings.inactivity_timeout_minutes || 15} Minutes`
                          : "Disabled"}
                      </span>
                    </p>
                    <p className="text-blue-700 mt-0.5 leading-relaxed">
                      {systemSettings.enable_inactivity_logout !== false
                        ? `Users without interaction for ${systemSettings.inactivity_timeout_minutes || 15} minutes will be safely signed out to prevent unauthorized access.`
                        : "Inactivity auto-logout is currently disabled. Users will remain logged in until their token expires or they manually sign out."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Card 1: Inactivity Logout Controls */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-[#e87722]" />
                        <h4 className="text-sm font-bold text-[#1a3a5c]">
                          Inactivity Timeout Configuration
                        </h4>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          systemSettings.enable_inactivity_logout !== false
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {systemSettings.enable_inactivity_logout !== false ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    {/* Enable / Disable Switch */}
                    <div className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          Enable Automatic Inactivity Logout
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Automatically log out users after period of no detected activity
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.enable_inactivity_logout !== false}
                          onChange={(e) =>
                            updateSystemSettings({
                              enable_inactivity_logout: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#e87722] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>

                    {/* Inactivity Limit Input */}
                    <div
                      className={`space-y-3 ${
                        systemSettings.enable_inactivity_logout === false
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }`}
                    >
                      <div>
                        <label className={labelCls}>
                          Inactivity Duration (in Minutes)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={720}
                            value={systemSettings.inactivity_timeout_minutes ?? 15}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              updateSystemSettings({
                                inactivity_timeout_minutes: isNaN(val) ? 15 : Math.max(1, val),
                              });
                            }}
                            className={inputCls}
                            placeholder="e.g. 15"
                          />
                          <span className="absolute right-3 top-2 text-xs font-medium text-gray-400">
                            minutes ({(Number(systemSettings.inactivity_timeout_minutes) || 15) * 60} sec)
                          </span>
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                          Quick Presets:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: "5 Min", value: 5 },
                            { label: "10 Min", value: 10 },
                            { label: "15 Min (Standard)", value: 15 },
                            { label: "30 Min", value: 30 },
                            { label: "60 Min (1 Hr)", value: 60 },
                            { label: "120 Min (2 Hr)", value: 120 },
                          ].map((preset) => {
                            const isSelected =
                              (systemSettings.inactivity_timeout_minutes ?? 15) === preset.value;
                            return (
                              <button
                                key={preset.value}
                                type="button"
                                onClick={() =>
                                  updateSystemSettings({
                                    inactivity_timeout_minutes: preset.value,
                                  })
                                }
                                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                                  isSelected
                                    ? "bg-[#1a3a5c] text-white border-[#1a3a5c] shadow-sm"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Security Details & Tracked Events */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#e87722]" />
                        <h4 className="text-sm font-bold text-[#1a3a5c]">
                          User Activity Detection
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        The dynamic timer monitors interactions across the portal and resets on any of the following user actions:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Mouse Movement", desc: "mousemove" },
                          { label: "Mouse Clicks", desc: "click / mousedown" },
                          { label: "Keyboard Press", desc: "keydown" },
                          { label: "Page Scrolling", desc: "scroll" },
                          { label: "Touch Gestures", desc: "touchstart" },
                          { label: "Navigation", desc: "route change" },
                        ].map((evt, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-white rounded-lg border border-gray-200 text-xs"
                          >
                            <p className="font-semibold text-gray-700">{evt.label}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{evt.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start gap-2 mt-2">
                      <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-amber-800 text-[11px] leading-tight">
                        <strong>Security Recommendation:</strong> Setting a timeout between 15 to 30 minutes protects sensitive customer and lead CRM data on shared or unattended devices.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSystemSettingsUpdate}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Saving…" : "Save Login / Logout Settings"}
                  </button>
                  <button
                    onClick={() =>
                      updateSystemSettings({
                        enable_inactivity_logout: true,
                        inactivity_timeout_minutes: 15,
                      })
                    }
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset to Defaults (15 min)
                  </button>
                </div>
              </div>
            )}

            {/* ══ SYSTEM TAB ══ */}
            {activeTab === "system" && user?.role === "admin" && systemSettings && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#1a3a5c]">System Configuration</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Configure global system settings and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Company Settings */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <h4 className="text-sm font-bold text-[#1a3a5c] flex items-center gap-2">
                      <Building className="h-4 w-4 text-[#e87722]" />
                      Company Settings
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Company Name</label>
                        <input type="text" value={systemSettings.company_name || ""} onChange={(e) => updateSystemSettings({ company_name: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Currency</label>
                        <select value={systemSettings.currency || "USD"} onChange={(e) => updateSystemSettings({ currency: e.target.value })} className={selectCls}>
                          <option value="INR">INR - Indian Rupee</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Date Format</label>
                        <select value={systemSettings.date_format || "YYYY-MM-DD"} onChange={(e) => updateSystemSettings({ date_format: e.target.value })} className={selectCls}>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Time Format</label>
                        <select value={systemSettings.time_format || "24h"} onChange={(e) => updateSystemSettings({ time_format: e.target.value })} className={selectCls}>
                          <option value="12h">12 Hour</option>
                          <option value="24h">24 Hour</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Default Language</label>
                        <select value={systemSettings.default_language || "en"} onChange={(e) => updateSystemSettings({ default_language: e.target.value })} className={selectCls}>
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Max File Size (MB)</label>
                        <input type="number" value={Math.round((systemSettings.max_file_size || 2097152) / 1048576)} onChange={(e) => updateSystemSettings({ max_file_size: (parseInt(e.target.value, 10) || 2) * 1048576 })} min={1} max={100} className={inputCls} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Backup Frequency</label>
                        <select value={systemSettings.backup_frequency || "daily"} onChange={(e) => updateSystemSettings({ backup_frequency: e.target.value })} className={selectCls}>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Appearance & Branding */}
                 <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
  <h4 className="text-sm font-bold text-[#1a3a5c] flex items-center gap-2">
    <Palette className="h-4 w-4 text-[#e87722]" />
    Appearance &amp; Branding
  </h4>

  {/* Colors */}
  <div className="grid grid-cols-2 gap-3">
    {[
      { label: "Primary Color", key: "primary_color", default: "#3B82F6" },
      { label: "Secondary Color", key: "secondary_color", default: "#10B981" },
    ].map((c) => (
      <div key={c.key}>
        <label className={labelCls}>{c.label}</label>
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus-within:ring-2 focus-within:ring-[#e87722]/40 focus-within:border-[#e87722]">
          <input
            type="color"
            value={systemSettings[c.key] || c.default}
            onChange={(e) => updateSystemSettings({ [c.key]: e.target.value })}
            className="w-8 h-7 rounded border-none p-0 cursor-pointer"
          />
          <input
            type="text"
            value={systemSettings[c.key] || c.default}
            onChange={(e) => updateSystemSettings({ [c.key]: e.target.value })}
            className="flex-1 text-xs bg-transparent border-none outline-none text-gray-700 min-w-0"
          />
        </div>
      </div>
    ))}
  </div>

  {/* Logo uploads — 1 col on mobile, 3 on sm+ */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <div>
      <label className={labelCls}>Company Logo</label>
      <UploadBox
        imageUrl={systemSettings.company_logo}
        alt="Company Logo"
        uploadId="logo-upload"
        onUpload={(f) => handleFileUpload(f, "company_logo")}
        onRemove={() => handleFileRemove("company_logo")}
        hint="PNG/JPG · 2MB"
      />
    </div>
    <div>
      <label className={labelCls}>Favicon</label>
      <UploadBox
        imageUrl={systemSettings.company_favicon}
        alt="Favicon"
        uploadId="favicon-upload"
        onUpload={(f) => handleFileUpload(f, "company_favicon")}
        onRemove={() => handleFileRemove("company_favicon")}
        hint="16×16 or 32×32"
      />
    </div>
    <div>
      <label className={labelCls}>Footer Logo</label>
      <UploadBox
        imageUrl={systemSettings.footer_logo}
        alt="Footer Logo"
        uploadId="footer-logo-upload"
        onUpload={(f) => handleFileUpload(f, "footer_logo")}
        onRemove={() => handleFileRemove("footer_logo")}
        hint="PNG/JPG · 2MB"
      />
    </div>
  </div>
</div>

                  {/* System Features — full width */}
                  <div className="lg:col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <h4 className="text-sm font-bold text-[#1a3a5c] flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#e87722]" />
                      System Features
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { title: "Auto Assign Leads", description: "Auto-assign new leads to agents", checked: !!systemSettings.auto_assign_leads, key: "auto_assign_leads", icon: Users, accent: "text-blue-500", bg: "bg-blue-50" },
                        { title: "Lead Scoring", description: "Enable AI-powered lead scoring", checked: !!systemSettings.lead_scoring_enabled, key: "lead_scoring_enabled", icon: Star, accent: "text-amber-500", bg: "bg-amber-50" },
                        { title: "Property Auto Approval", description: "Auto-approve property listings", checked: !!systemSettings.property_auto_approval, key: "property_auto_approval", icon: CheckCircle, accent: "text-emerald-500", bg: "bg-emerald-50" },
                      ].map((f) => (
                        <div key={f.key} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 ${f.bg} rounded-lg flex items-center justify-center shrink-0`}>
                              <f.icon className={`h-4 w-4 ${f.accent}`} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{f.title}</p>
                              <p className="text-[10px] text-gray-400 leading-tight">{f.description}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                            <input type="checkbox" checked={f.checked} onChange={(e) => updateSystemSettings({ [f.key]: e.target.checked } as Partial<SystemSettings>)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#e87722] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Public Lead Capture & Guest View Limits */}
                  <div className="lg:col-span-2 p-4 bg-gradient-to-r from-orange-50/50 to-amber-50/30 border border-orange-200/70 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#1a3a5c] flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-[#e87722]" />
                          Guest Property View Limit (Lead Generation)
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Require unauthenticated visitors to register or sign in after viewing a set number of properties.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={systemSettings.enable_guest_property_limit !== false}
                          onChange={(e) =>
                            updateSystemSettings({
                              enable_guest_property_limit: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#e87722] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4 shadow-sm" />
                      </label>
                    </div>

                    {systemSettings.enable_guest_property_limit !== false && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-orange-100">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Free Property Views Before Registration
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={systemSettings.guest_property_view_limit ?? 5}
                              onChange={(e) =>
                                updateSystemSettings({
                                  guest_property_view_limit: parseInt(e.target.value, 10) || 5,
                                })
                              }
                              className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#e87722] focus:border-transparent outline-none bg-white"
                            />
                            <span className="text-xs text-gray-500">properties allowed</span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-white/80 border border-orange-100 rounded-lg text-xs text-gray-600 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>Visitors will be redirected to the Registration page on property #{Number(systemSettings.guest_property_view_limit ?? 5) + 1}.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button onClick={handleSystemSettingsUpdate} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors">
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Saving…" : "Save Settings"}
                  </button>
                  <button onClick={() => { window.location.reload(); toast.info("System settings refreshed"); }} disabled={saving} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
                    <RotateCcw className="h-3.5 w-3.5" /> Refresh
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;