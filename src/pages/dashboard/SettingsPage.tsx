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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { usersAPI } from "@/lib/api";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import { masterDataAPI } from "@/lib/mastersAPI";
import systemSettingsAPI from "@/lib/systemSettingsAPI";
import { toast } from "react-toastify";

/**
 * Local types
 */
interface UserProfile {
  id: string;
  username?: string;
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

/** A flexible shape for system settings - add more keys here if you have them typed elsewhere */
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
  [k: string]: any;
}

const SettingsPage: React.FC = () => {
  // auth/context hooks — cast to known shapes so TS can check usages below.
  const { user, updateUser } = useAuth();
  // useSystemSettings may be typed in your project; assert here for local usage
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
    "profile" | "notifications" | "system" | "security"
  >("profile");
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Master data state
  const [masterOptions, setMasterOptions] = useState({
    roles: [] as { value: string; label: string }[],
    departments: [] as { value: string; label: string }[],
  });

  useEffect(() => {
    fetchUserProfile();
    fetchMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMasterData = async () => {
    try {
      // masterDataAPI shapes aren't known here — treat responses as any
      const commonMasterTypes: any[] = await masterDataAPI.getAllMasterTypes(
        "common"
      );

      const masterValues = await Promise.all(
        commonMasterTypes.map((masterType: any) =>
          masterDataAPI.getMasterValues(masterType.id)
        )
      );

      const organizedData: Record<string, { value: string; label: string }[]> =
        {};

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
      toast.error("Failed to load dropdown options");
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response: any = await usersAPI.getProfile();
      if (response?.success) {
        // normalize missing fields with safe defaults
        const p: UserProfile = {
          id: String(response.data.id ?? ""),
          username: response.data.username ?? "",
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
          ...response.data,
        };
        setProfile(p);
      } else {
        // if API returns success:false, still try to use data if present
        if (response?.data) {
          setProfile(response.data as UserProfile);
        }
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
      const response: any = await usersAPI.updateProfile(profile);

      if (response?.success) {
        toast.success("Profile updated successfully");

        const updatedProfile = {
          ...profile,
          ...response.data,
        };
        setProfile(updatedProfile);

        // update AuthContext — only pass fields that match your User type.
        // Removed 'designation' because User type in your app doesn't include it.
        updateUser({
          first_name: response.data.first_name || user?.first_name,
          last_name: response.data.last_name || user?.last_name,
          role: response.data.role || user?.role,
          avatar: response.data.avatar || (user as any)?.avatar,
        } as Partial<typeof user>);
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

  // Profile picture upload handler
  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, PNG, GIF)");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const response: any = await usersAPI.uploadAvatar(formData);

      if (response?.success) {
        const updatedProfile = {
          ...profile!,
          avatar: `${response.data.avatar}?t=${Date.now()}`,
        };
        setProfile(updatedProfile);
        // ✅ update AuthContext (topbar will reflect immediately)
        updateUser({ avatar: updatedProfile.avatar } as Partial<typeof user>);
        toast.success("Profile picture updated successfully");
      } else {
        toast.error(response?.message || "Failed to upload profile picture");
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(
        error?.response?.data?.message || "Failed to upload profile picture"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Remove profile picture handler
  const handleAvatarRemove = async () => {
    if (!profile?.avatar) return;

    try {
      setUploadingAvatar(true);

      const response: any = await usersAPI.removeAvatar();

      if (response?.success) {
        const updatedProfile = { ...profile, avatar: undefined };
        setProfile(updatedProfile);

        // ✅ update AuthContext
        updateUser({ avatar: undefined } as Partial<typeof user>);

        toast.success("Profile picture removed successfully");
      } else {
        toast.error(response?.message || "Failed to remove profile picture");
      }
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      toast.error(
        error?.response?.data?.message || "Failed to remove profile picture"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      const resp: any = await usersAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      if (resp?.success) {
        toast.success("Password changed successfully");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
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
      toast.success("System settings updated successfully");
    } catch (error: any) {
      console.error("Error updating system settings:", error);
      toast.error("Failed to update system settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    type: "company_logo" | "company_favicon" | "footer_logo"
  ) => {
    if (!systemSettings) return;

    try {
      const formData = new FormData();
      formData.append(type, file);

      // append other scalar settings (string/number/boolean) to formData
      Object.keys(systemSettings).forEach((key) => {
        if (key === type) return;
        const val = systemSettings[key];
        if (val !== undefined && val !== null) {
          // convert primitives to string
          if (typeof val === "object") return;
          formData.append(key, String(val));
        }
      });

      const data: any = await systemSettingsAPI.saveSettings(formData);

      if (data?.success) {
        updateSystemSettings({
          [type]: `${data.data[type]}?t=${Date.now()}`,
        } as Partial<SystemSettings>);

        let successMessage = "";
        switch (type) {
          case "company_logo":
            successMessage = "Company logo updated successfully";
            break;
          case "company_favicon":
            successMessage = "Favicon updated successfully";
            break;
          case "footer_logo":
            successMessage = "Footer logo updated successfully";
            break;
        }

        toast.success(successMessage);
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
      let removeKey = "";

      switch (type) {
        case "company_logo":
          removeKey = "remove_logo";
          break;
        case "company_favicon":
          removeKey = "remove_favicon";
          break;
        case "footer_logo":
          removeKey = "remove_footer_logo";
          break;
      }

      formData.append(removeKey, "true");

      const data: any = await systemSettingsAPI.saveSettings(formData);

      if (data?.success) {
        updateSystemSettings({ [type]: null } as Partial<SystemSettings>);

        let successMessage = "";
        switch (type) {
          case "company_logo":
            successMessage = "Company logo removed";
            break;
          case "company_favicon":
            successMessage = "Favicon removed";
            break;
          case "footer_logo":
            successMessage = "Footer logo removed";
            break;
        }

        toast.info(successMessage);
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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  const quickLinks = [
    {
      title: "Master Data",
      description: "Manage system data and configurations",
      icon: Database,
      color: "blue",
      href: "/dashboard/settings/master-data",
    },
    {
      title: "Import/Export",
      description: "Data import and export tools",
      icon: Download,
      color: "green",
      href: "/dashboard/settings/import-export",
    },
    {
      title: "AI Settings",
      description: "Configure AI features and automation",
      icon: Zap,
      color: "purple",
      href: "/dashboard/settings/ai-settings",
    },
    {
      title: "User Management",
      description: "Manage users and their permissions",
      icon: Users,
      color: "orange",
      href: "/dashboard/users",
    },
  ] as const;

  const colorMap: Record<string, string> = {
    blue: "bg-gradient-to-r from-blue-500 to-blue-600",
    green: "bg-gradient-to-r from-green-500 to-green-600",
    purple: "bg-gradient-to-r from-purple-500 to-purple-600",
    orange: "bg-gradient-to-r from-orange-500 to-orange-600",
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    ...(user?.role === "admin"
      ? [{ id: "system" as const, label: "System", icon: Settings }]
      : []),
  ];

  return (
    <div className="">
      <div className="max-w-8xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-6 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white leading-tight">
                    Settings
                  </h1>
                  <p className="text-xs text-white/90 font-medium">
                    Manage your account and system preferences
                  </p>
                </div>
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex flex-wrap gap-2">
              <Link to="/dashboard/settings/roles-permissions">
                <Button
                  variant="outline"
                  className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-sm text-white border-white/30 hover:border-white/50 transition-all duration-200 px-3 py-1.5 h-auto"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Roles & Permissions</span>
                </Button>
              </Link>
              <Link to="/dashboard/settings/integrations">
                <Button
                  variant="outline"
                  className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-sm text-white border-white/30 hover:border-white/50 transition-all duration-200 px-3 py-1.5 h-auto"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Integrations</span>
                </Button>
              </Link>
            </div>

          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`h-10 w-10 ${colorMap[link.color]} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}
                >
                  <link.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                    {link.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </Link>
          ))}
        </div>


        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/50">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-shrink-0 px-6 py-4 font-medium text-sm md:text-base transition-all duration-200 border-b-[3px] ${activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-white shadow-sm"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/40 rounded-t-md"
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>


          <div className="p-8">
            {/* PROFILE TAB */}
            {activeTab === "profile" && profile && (
              <div className="space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-4">
                  <div className="relative group">
                    <div className="h-28 w-28 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={`${profile.first_name || "User"}'s avatar`}
                          className="h-full w-full rounded-full object-cover"
                          key={profile.avatar}
                        />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}

                      {/* uploading overlay */}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full" aria-live="polite">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>

                    {/* hover overlay + file input (single control) */}
                    <label className="absolute -bottom-1 right-0 transform translate-y-1/2">
                      <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm text-sm hover:shadow-md transition">
                        <Camera className="h-4 w-4 text-slate-600" />
                        <span className="text-slate-700 font-medium">Change</span>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                        }}
                        className="sr-only"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-slate-900">Profile Information</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Keep your personal details up to date so your account and notifications are correct.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <label className="cursor-pointer">
                        <div className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-200 hover:border-blue-300">
                          <Upload className="h-4 w-4" />
                          {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAvatarUpload(file);
                          }}
                          className="hidden"
                          disabled={uploadingAvatar}
                        />
                      </label>

                      {profile.avatar && (
                        <button
                          onClick={handleAvatarRemove}
                          disabled={uploadingAvatar}
                          className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200 hover:border-red-300"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Recommended: at least 200×200 px. Max 5MB. Supported: JPG, PNG, GIF.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "First name", value: profile.first_name ?? "", key: "first_name", type: "text", placeholder: "John" },
                    { label: "Last name", value: profile.last_name ?? "", key: "last_name", type: "text", placeholder: "Doe" },
                    { label: "Email", value: profile.email ?? "", key: "email", type: "email", placeholder: "you@example.com", readOnly: true },
                    { label: "Phone", value: profile.phone ?? "", key: "phone", type: "tel", placeholder: "+1 555 555 555" },
                    { label: "Designation", value: profile.designation ?? "", key: "designation", type: "text", placeholder: "Product Manager" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        value={field.value}
                        readOnly={field.readOnly}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            [field.key]: e.target.value,
                          })
                        }
                        className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-blue-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/60 ${field.readOnly ? "opacity-70 cursor-not-allowed" : ""}`}
                        aria-label={field.label}
                      />
                    </div>
                  ))}

                  {/* Department */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Department</label>
                    <select
                      value={masterOptions.departments.find((d) => d.label === profile.department)?.value || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          department: masterOptions.departments.find((d) => d.value === e.target.value)?.label || "",
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/60 appearance-none cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      {masterOptions.departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Role</label>
                    <select
                      value={masterOptions.roles.find((r) => r.label === profile.role)?.value || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          role: masterOptions.roles.find((r) => r.value === e.target.value)?.label || "",
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/60 appearance-none cursor-pointer"
                    >
                      <option value="">Select Role</option>
                      {masterOptions.roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Timezone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Timezone</label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/60 appearance-none cursor-pointer"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Asia/Kolkata">India Standard Time</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Language</label>
                    <select
                      value={profile.language}
                      onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/60 appearance-none cursor-pointer"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-slate-200">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={saving || uploadingAvatar}
                      className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl rounded-xl px-4 py-2 transition"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save changes"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        fetchUserProfile();
                        fetchMasterData();
                      }}
                      disabled={saving || uploadingAvatar}
                      className="inline-flex items-center border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-xl px-4 py-2 transition"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Changes are saved to your account. Email is not editable here — contact admin to update email.
                  </p>
                </div>
              </div>
            )}


            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && profile && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    Notification Preferences
                  </h3>
                  <p className="text-xs text-slate-600">
                    Choose how you want to receive notifications
                  </p>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Mail,
                      title: "Email Notifications",
                      description: "Receive notifications via email",
                      checked: profile.email_notifications,
                      key: "email_notifications",
                      color: "text-blue-500",
                    },
                    {
                      icon: Smartphone,
                      title: "SMS Notifications",
                      description: "Receive notifications via SMS",
                      checked: profile.sms_notifications,
                      key: "sms_notifications",
                      color: "text-green-500",
                    },
                    {
                      icon: Bell,
                      title: "Push Notifications",
                      description: "Receive browser push notifications",
                      checked: profile.push_notifications,
                      key: "push_notifications",
                      color: "text-purple-500",
                    },
                  ].map((notification) => (
                    <div
                      key={notification.key}
                      className="bg-white/50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <notification.icon
                              className={`h-4 w-4 ${notification.color}`}
                            />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-900">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-slate-600">
                              {notification.description}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notification.checked}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                [notification.key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex pt-4 border-t border-slate-200">
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs px-3 py-2"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {saving ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    Security Settings
                  </h3>
                  <p className="text-xs text-slate-600">
                    Manage your password and security preferences
                  </p>
                </div>

                {/* Security Tip */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800 text-sm">Security Tip</h4>
                      <p className="text-amber-700 text-xs leading-snug">
                        Use a strong password with at least 8 characters, including
                        uppercase, lowercase, numbers, and symbols.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-white/50 rounded-lg p-4 border border-slate-200">
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Change Password</h4>

                  {/* Shared input class for consistency */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current_password: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                        className="w-full border border-slate-400 rounded-lg px-3 py-2 text-sm outline-blue-600
                       focus:border-blue-600 focus:ring-1 focus:ring-blue-600
                       transition-all bg-white/50"
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password: e.target.value,
                          })
                        }
                        placeholder="Enter new password"
                        className="w-full border border-slate-400 rounded-lg px-3 py-2 text-sm outline-blue-600
                       focus:border-blue-600 focus:ring-1 focus:ring-blue-600
                       transition-all bg-white/50"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirm_password: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                        className="w-full border border-slate-400 rounded-lg px-3 py-2 text-sm outline-blue-600
                       focus:border-blue-600 focus:ring-1 focus:ring-blue-600
                       transition-all bg-white/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex pt-4 border-t border-slate-200">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={
                      saving ||
                      !passwordData.current_password ||
                      !passwordData.new_password ||
                      !passwordData.confirm_password
                    }
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all text-xs px-3 py-2"
                  >
                    <Lock className="h-3.5 w-3.5 mr-1" />
                    {saving ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </div>
            )}

            {/* SYSTEM TAB (admin only) */}
            {activeTab === "system" &&
              user?.role === "admin" &&
              systemSettings && (
                <div className="space-y-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">System Configuration</h3>
                    <p className="text-slate-700 text-xs">Configure global system settings and preferences</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Company Settings */}
                    <div className="bg-white/50 rounded-lg p-4 border border-slate-200 space-y-4 hover:outline hover:outline-1 hover:outline-blue-300 transition-all duration-150">
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                        <Building className="h-4 w-4 text-blue-500" />
                        Company Settings
                      </h4>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1">Company Name</label>
                            <input
                              type="text"
                              value={systemSettings.company_name || ""}
                              onChange={(e) => updateSystemSettings({ company_name: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white/50 text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1">Currency</label>
                            <select
                              value={systemSettings.currency || "USD"}
                              onChange={(e) => updateSystemSettings({ currency: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg  px-2 py-1.5 text-xs bg-white/50 cursor-pointer text-slate-900 focus:ring-1 focus:ring-blue-400"
                            >
                              <option value="INR">INR - Indian Rupee</option>
                              <option value="USD">USD - US Dollar</option>
                              <option value="EUR">EUR - Euro</option>
                              <option value="GBP">GBP - British Pound</option>
                              <option value="CAD">CAD - Canadian Dollar</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1">Date Format</label>
                            <select
                              value={systemSettings.date_format || "YYYY-MM-DD"}
                              onChange={(e) => updateSystemSettings({ date_format: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white/50 cursor-pointer text-slate-900 focus:ring-1 focus:ring-blue-400"
                            >
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1">Time Format</label>
                            <select
                              value={systemSettings.time_format || "24h"}
                              onChange={(e) => updateSystemSettings({ time_format: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white/50 cursor-pointer text-slate-900 focus:ring-1 focus:ring-blue-400"
                            >
                              <option value="12h">12 Hour</option>
                              <option value="24h">24 Hour</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-900 mb-1">Default Language</label>
                          <select
                            value={systemSettings.default_language || "en"}
                            onChange={(e) => updateSystemSettings({ default_language: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white/50 cursor-pointer text-slate-900 focus:ring-1 focus:ring-blue-400"
                          >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1">Max File Size (MB)</label>
                            <input
                              type="number"
                              value={Math.round((systemSettings.max_file_size || 2097152) / 1048576)}
                              onChange={(e) =>
                                updateSystemSettings({ max_file_size: (parseInt(e.target.value, 10) || 2) * 1048576 })
                              }
                              min={1}
                              max={100}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white/50 text-slate-900 focus:ring-1 focus:ring-blue-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1">Backup Frequency</label>
                            <select
                              value={systemSettings.backup_frequency || "daily"}
                              onChange={(e) => updateSystemSettings({ backup_frequency: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white/50 cursor-pointer text-slate-900 focus:ring-1 focus:ring-blue-400"
                            >
                              <option value="hourly">Hourly</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Appearance & Branding */}
                    <div className="bg-white/50 rounded-lg p-4 border border-slate-200 space-y-4 hover:outline hover:outline-1 hover:outline-blue-300 transition-all duration-150">
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1 focus:ring-1 focus:ring-blue-400">
                        <Palette className="h-4 w-4 text-purple-500" />
                        Appearance & Branding
                      </h4>

                      <div className="space-y-4">
                        {/* Color Section */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Primary Color */}
                          <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1">Primary Color</label>
                            <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1 focus-within:ring-1 focus-within:ring-blue-400 transition">
                              <input
                                type="color"
                                value={systemSettings.primary_color || "#3B82F6"}
                                onChange={(e) => updateSystemSettings({ primary_color: e.target.value })}
                                className="w-10 h-8 rounded-sm border-none p-0 m-0 appearance-none cursor-pointer"
                                aria-label="Primary color"
                              />
                              <input
                                type="text"
                                value={systemSettings.primary_color || "#3B82F6"}
                                onChange={(e) => updateSystemSettings({ primary_color: e.target.value })}
                                className="flex-1 border-none px-2 py-1 text-xs bg-transparent text-slate-900 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Secondary Color */}
                          <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1">Secondary Color</label>
                            <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1 focus-within:ring-1 focus-within:ring-blue-400 transition">
                              <input
                                type="color"
                                value={systemSettings.secondary_color || "#10B981"}
                                onChange={(e) => updateSystemSettings({ secondary_color: e.target.value })}
                                className="w-10 h-8 rounded-sm border-none p-0 m-0 appearance-none cursor-pointer"
                                aria-label="Secondary color"
                              />
                              <input
                                type="text"
                                value={systemSettings.secondary_color || "#10B981"}
                                onChange={(e) => updateSystemSettings({ secondary_color: e.target.value })}
                                className="flex-1 border-none px-2 py-1 text-xs bg-transparent text-slate-900 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Favicon Section - Centered and Compact */}
                        <div className="flex justify-center">
                          <div className="w-2/3 max-w-sm">
                            <label className="block text-xs font-medium text-slate-900 mb-1 text-center">Favicon</label>
                            <div
                              tabIndex={0}
                              className="border-2 border-dashed border-slate-300 rounded-md p-3 text-center hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                            >
                              {systemSettings.company_favicon ? (
                                <div className="space-y-2">
                                  <img
                                    src={systemSettings.company_favicon}
                                    alt="Favicon"
                                    className="h-6 w-6 mx-auto object-contain"
                                  />
                                  <div className="flex justify-center gap-2">
                                    <input
                                      id="favicon-upload"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "company_favicon");
                                      }}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor="favicon-upload"
                                      className="cursor-pointer bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs transition-colors hover:bg-blue-100 hover:text-blue-700"
                                    >
                                      Change
                                    </label>
                                    <button
                                      onClick={() => handleFileRemove("company_favicon")}
                                      className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs transition-colors hover:bg-red-100 hover:text-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2 text-slate-900">
                                  <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                                  <div>
                                    <input
                                      id="favicon-upload-empty"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "company_favicon");
                                      }}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor="favicon-upload-empty"
                                      className="cursor-pointer bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs inline-block transition-colors hover:bg-blue-100 hover:text-blue-700"
                                    >
                                      Upload Favicon
                                    </label>
                                    <p className="text-xs text-slate-500 mt-1">16x16 or 32x32 px</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Logo Section */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Company Logo */}
                          <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1">Company Logo</label>
                            <div
                              tabIndex={0}
                              className="border-2 border-dashed border-slate-300 rounded-md p-3 text-center hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                            >
                              {systemSettings.company_logo ? (
                                <div className="space-y-2">
                                  <img
                                    src={systemSettings.company_logo}
                                    alt="Company Logo"
                                    className="h-10 w-auto mx-auto object-contain"
                                  />
                                  <div className="flex justify-center gap-2">
                                    <input
                                      id="logo-upload"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "company_logo");
                                      }}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor="logo-upload"
                                      className="cursor-pointer bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs transition-colors hover:bg-blue-100 hover:text-blue-700"
                                    >
                                      Change
                                    </label>
                                    <button
                                      onClick={() => handleFileRemove("company_logo")}
                                      className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs transition-colors hover:bg-red-100 hover:text-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2 text-slate-900">
                                  <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                                  <div>
                                    <input
                                      id="logo-upload-empty"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "company_logo");
                                      }}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor="logo-upload-empty"
                                      className="cursor-pointer bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs inline-block transition-colors hover:bg-blue-100 hover:text-blue-700"
                                    >
                                      Upload Logo
                                    </label>
                                    <p className="text-xs text-slate-500 mt-1">PNG/JPG up to 2MB</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Footer Logo */}
                          <div>
                            <label className="block text-xs font-medium text-slate-900 mb-1">Footer Logo</label>
                            <div
                              tabIndex={0}
                              className="border-2 border-dashed border-slate-300 rounded-md p-3 text-center hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                            >
                              {systemSettings.footer_logo ? (
                                <div className="space-y-2">
                                  <img
                                    src={systemSettings.footer_logo}
                                    alt="Footer Logo"
                                    className="h-10 w-auto mx-auto object-contain"
                                  />
                                  <div className="flex justify-center gap-2">
                                    <input
                                      id="footer-logo-upload"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "footer_logo");
                                      }}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor="footer-logo-upload"
                                      className="cursor-pointer bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs transition-colors hover:bg-blue-100 hover:text-blue-700"
                                    >
                                      Change
                                    </label>
                                    <button
                                      onClick={() => handleFileRemove("footer_logo")}
                                      className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs transition-colors hover:bg-red-100 hover:text-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2 text-slate-900">
                                  <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                                  <div>
                                    <input
                                      id="footer-logo-upload-empty"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "footer_logo");
                                      }}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor="footer-logo-upload-empty"
                                      className="cursor-pointer bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs inline-block transition-colors hover:bg-blue-100 hover:text-blue-700"
                                    >
                                      Upload Logo
                                    </label>
                                    <p className="text-xs text-slate-500 mt-1">PNG/JPG up to 2MB</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* System Features (span 2) */}
                    <div className="lg:col-span-2 bg-white/50 rounded-lg p-4 border border-slate-200 space-y-4">
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        System Features
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          {
                            title: "Auto Assign Leads",
                            description: "Automatically assign new leads to agents",
                            checked: !!systemSettings.auto_assign_leads,
                            key: "auto_assign_leads",
                            icon: Users,
                            color: "text-blue-500",
                          },
                          {
                            title: "Lead Scoring",
                            description: "Enable AI-powered lead scoring",
                            checked: !!systemSettings.lead_scoring_enabled,
                            key: "lead_scoring_enabled",
                            icon: Star,
                            color: "text-yellow-500",
                          },
                          {
                            title: "Property Auto Approval",
                            description: "Automatically approve property listings",
                            checked: !!systemSettings.property_auto_approval,
                            key: "property_auto_approval",
                            icon: CheckCircle,
                            color: "text-green-500",
                          },
                        ].map((feature) => (
                          <div
                            key={feature.key}
                            className="bg-white/70 rounded-lg p-3 border border-slate-200 hover:border-slate-300 transition-all duration-150"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                                <feature.icon className={`h-4 w-4 ${feature.color}`} />
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={feature.checked}
                                  onChange={(e) =>
                                    updateSystemSettings({ [feature.key]: e.target.checked } as Partial<SystemSettings>)
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                              </label>
                            </div>
                            <div>
                              <h5 className="font-semibold text-slate-900 text-xs">{feature.title}</h5>
                              <p className="text-xs text-slate-600">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-slate-200">
                    <Button
                      onClick={handleSystemSettingsUpdate}
                      disabled={saving}
                      className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      {saving ? "Saving..." : "Save"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.reload();
                        toast.info("System settings refreshed");
                      }}
                      disabled={saving}
                      className="px-3 py-1.5 text-xs border-slate-300 hover:bg-slate-50"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
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