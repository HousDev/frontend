// contexts/SystemSettingsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { systemSettingsAPI } from "@/lib/systemSettingsAPI";
import { toast } from "react-toastify";

export interface SystemSettings {
  company_name: string;
  company_logo?: string;
  footer_logo?: string;
  company_favicon?: string;
  primary_color: string;
  secondary_color: string;
  currency: string;
  date_format: string;
  time_format: string;
  default_language: string;
  max_file_size: number;
  backup_frequency: string;
  auto_assign_leads: boolean;
  lead_scoring_enabled: boolean;
  property_auto_approval: boolean;
  inactivity_timeout_minutes?: number;
  enable_inactivity_logout?: boolean;
  enable_guest_property_limit?: boolean;
  guest_property_view_limit?: number;
}

export interface SystemSettingsContextType {
  systemSettings: SystemSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  saveSystemSettings: () => Promise<void>;
  refreshSystemSettings: () => Promise<void>;
  handleFileUpload: (
    file: File,
    type: "company_logo" | "company_favicon" | "footer_logo"
  ) => Promise<void>;
  handleFileRemove: (
    type: "company_logo" | "company_favicon" | "footer_logo"
  ) => void;
  resetError: () => void;
  clearSettings: () => void; // ✅ new
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | null>(
  null
);

export const useSystemSettings = (): SystemSettingsContextType => {
  const context = useContext(SystemSettingsContext);
  if (context === null) {
    throw new Error(
      "useSystemSettings must be used within a SystemSettingsProvider"
    );
  }
  return context;
};

interface SystemSettingsProviderProps {
  children: ReactNode;
}

// Helpers
const getStoredSettings = (): SystemSettings | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage?.getItem("systemSettings");
    if (saved) return JSON.parse(saved) as SystemSettings;
  } catch (error) {
    console.warn("Failed to parse stored system settings:", error);
  }
  return null;
};

const storeSettings = (settings: SystemSettings): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.setItem("systemSettings", JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to store system settings:", error);
  }
};

const toAbsolute = (url?: string) => {
  if (!url) return url;
  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
};

export const SystemSettingsProvider: React.FC<SystemSettingsProviderProps> = ({
  children,
}) => {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(
    () => getStoredSettings()
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage when updated
  useEffect(() => {
    if (systemSettings) {
      storeSettings(systemSettings);
    }
  }, [systemSettings]);

  // Update favicon + title dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      let link =
        document.querySelector<HTMLLinkElement>("link[rel~='icon']") || null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = systemSettings?.company_favicon || "";
      if (systemSettings?.company_name) {
        document.title = systemSettings.company_name;
      }
    } catch (error) {
      console.warn("Failed to update favicon/title:", error);
    }
  }, [systemSettings?.company_favicon, systemSettings?.company_name]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const fetchSystemSettings = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = (await systemSettingsAPI.getSettings()) as ApiResponse<
        SystemSettings
      >;

      if (response?.data) {
        const settings = {
          ...response.data,
          company_logo: toAbsolute(response.data.company_logo),
          footer_logo: toAbsolute(response.data.footer_logo),
          company_favicon: toAbsolute(response.data.company_favicon),
          enable_guest_property_limit: Boolean(response.data.enable_guest_property_limit),
          enable_inactivity_logout: Boolean(response.data.enable_inactivity_logout),
        };
        setSystemSettings(settings as SystemSettings);
      } else {
        throw new Error(response?.message || "Failed to load system settings");
      }
    } catch (error: any) {
      console.error("Error fetching system settings:", error);
      setError(error?.message || "Failed to load system settings");

      const storedSettings = getStoredSettings();
      if (storedSettings) {
        setSystemSettings(storedSettings);
      } else {
        setSystemSettings(null); // ❌ no static defaults
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemSettings();
  }, [fetchSystemSettings]);

  const updateSystemSettings = useCallback(
    (settings: Partial<SystemSettings>) => {
      setSystemSettings((prevSettings) =>
        prevSettings ? { ...prevSettings, ...settings } : ({ ...settings } as SystemSettings)
      );
      setError(null);
    },
    []
  );

  const saveSystemSettings = useCallback(async (): Promise<void> => {
    if (!systemSettings) throw new Error("No system settings to save");

    try {
      setSaving(true);
      setError(null);

      const formData = new FormData();
      Object.entries(systemSettings).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = (await systemSettingsAPI.saveSettings(
        formData
      )) as ApiResponse<SystemSettings>;

      if (response?.success && response.data) {
        const updated = {
          ...response.data,
          company_logo: toAbsolute(response.data.company_logo),
          footer_logo: toAbsolute(response.data.footer_logo),
          company_favicon: toAbsolute(response.data.company_favicon),
        };
        setSystemSettings(updated as SystemSettings);
        toast.success("System settings updated successfully");
      } else {
        throw new Error(response?.message || "Failed to update system settings");
      }
    } catch (error: any) {
      console.error("Error updating system settings:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update system settings";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [systemSettings]);

  const refreshSystemSettings = useCallback(async (): Promise<void> => {
    try {
      await fetchSystemSettings();
      toast.success("System settings refreshed successfully");
    } catch {
      toast.error("Failed to refresh system settings");
    }
  }, [fetchSystemSettings]);

  const handleFileUpload = useCallback(
    async (
      file: File,
      type: "company_logo" | "company_favicon" | "footer_logo"
    ) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }

      const maxSize = systemSettings?.max_file_size || 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(
          `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`
        );
        return;
      }

      try {
        const formData = new FormData();
        formData.append(type, file);

        const response =
          (await systemSettingsAPI.saveSettings(
            formData
          )) as ApiResponse<Partial<SystemSettings>>;

        if (response?.success && response.data) {
          const returnedUrl = (response.data as any)[type] as string | undefined;
          if (returnedUrl) {
            setSystemSettings((prev) => ({
              ...(prev || {}),
              [type]: toAbsolute(`${returnedUrl}?t=${Date.now()}`),
            }) as SystemSettings);

            await fetchSystemSettings();
          }
        } else {
          throw new Error(response?.message || "Failed to upload image");
        }
      } catch (error: any) {
        console.error("Error uploading file:", error);
        const errorMessage = error?.message || "Failed to upload file";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
    [systemSettings?.max_file_size, fetchSystemSettings]
  );

  const handleFileRemove = useCallback(
    (type: "company_logo" | "company_favicon" | "footer_logo") => {
      setSystemSettings((prev) => ({
        ...(prev || {}),
        [type]: "",
      }) as SystemSettings);
      toast.info(`${type.replace("_", " ")} removed from settings`);
      setError(null);
    },
    []
  );

  // ✅ Clear settings (for logout)
  const clearSettings = useCallback(() => {
    setSystemSettings(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("systemSettings");
    }
  }, []);

  const value: SystemSettingsContextType = {
    systemSettings,
    loading,
    saving,
    error,
    updateSystemSettings,
    saveSystemSettings,
    refreshSystemSettings,
    handleFileUpload,
    handleFileRemove,
    resetError,
    clearSettings, // ✅ added
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export { SystemSettingsContext };
