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
}

interface SystemSettingsContextType {
  systemSettings: SystemSettings | null;
  loading: boolean;
  saving: boolean;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  saveSystemSettings: () => Promise<void>;
  refreshSystemSettings: () => Promise<void>;
  handleFileUpload: (
    file: File,
    type: "company_logo" | "company_favicon"
  ) => Promise<void>;
  handleFileRemove: (type: "company_logo" | "company_favicon") => void;
}

/**
 * Generic API response shape used locally here.
 * If your systemSettingsAPI already exports a type, prefer that instead.
 */
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

export const SystemSettingsProvider: React.FC<
  SystemSettingsProviderProps
> = ({ children }) => {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(
    () => {
      try {
        const saved = localStorage.getItem("systemSettings");
        return saved ? (JSON.parse(saved) as SystemSettings) : null;
      } catch {
        return null;
      }
    }
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      if (systemSettings) {
        localStorage.setItem("systemSettings", JSON.stringify(systemSettings));
      }
    } catch (err) {
      // ignore localStorage errors
      console.warn("Failed to persist system settings to localStorage", err);
    }
  }, [systemSettings]);

  // Sync favicon + document title
  useEffect(() => {
    if (systemSettings?.company_favicon) {
      const link = document.querySelector<HTMLLinkElement>(
        "link[rel~='icon']"
      );
      if (link) {
        link.href = systemSettings.company_favicon;
      } else {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = systemSettings.company_favicon;
        document.head.appendChild(newLink);
      }
    }
    if (systemSettings?.company_name) {
      document.title = systemSettings.company_name;
    }
  }, [systemSettings?.company_favicon, systemSettings?.company_name]);

  // Fetch system settings from API
  const fetchSystemSettings = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // assume systemSettingsAPI.getSettings() returns something like ApiResponse<SystemSettings>
      const response = (await systemSettingsAPI.getSettings()) as ApiResponse<
        SystemSettings
      >;

      if (response?.data) {
        setSystemSettings(response.data);
      } else {
        console.warn("No system settings found");
      }
    } catch (error) {
      console.error("Error fetching system settings:", error);
      toast.error("Failed to load system settings, using last saved data");
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: if no local data, fallback to API
  useEffect(() => {
    if (!systemSettings) {
      void fetchSystemSettings();
    } else {
      setLoading(false);
    }
  }, [systemSettings, fetchSystemSettings]);

  // Update system settings locally (optimistic update)
  const updateSystemSettings = useCallback(
    (settings: Partial<SystemSettings>) => {
      setSystemSettings((prevSettings) => ({
        ...(prevSettings || ({} as SystemSettings)),
        ...settings,
      }));
    },
    []
  );

  // Save system settings to API
  const saveSystemSettings = useCallback(async (): Promise<void> => {
    if (!systemSettings) {
      throw new Error("No system settings to save");
    }

    try {
      setSaving(true);
      const formData = new FormData();

      (Object.entries(systemSettings) as [keyof SystemSettings, any][]).forEach(
        ([key, value]) => {
          // only append defined values
          if (value !== undefined && value !== null) {
            // FormData expects string | Blob; convert primitives to string
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
              formData.append(String(key), String(value));
            } else {
              // For complex objects (shouldn't normally be present here), stringify
              formData.append(String(key), JSON.stringify(value));
            }
          }
        }
      );

      const response = (await systemSettingsAPI.saveSettings(
        formData
      )) as ApiResponse<SystemSettings>;

      if (response?.success && response.data) {
        setSystemSettings(response.data);
        toast.success("System settings updated successfully");
      } else if (response?.data) {
        setSystemSettings(response.data);
        toast.success("System settings updated successfully");
      } else {
        // fallback success message if API returns success without data
        toast.success("System settings updated successfully");
      }
    } catch (error: any) {
      console.error("Error updating system settings:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update system settings"
      );
      throw error;
    } finally {
      setSaving(false);
    }
  }, [systemSettings]);

  // Refresh system settings from API
  const refreshSystemSettings = useCallback(async (): Promise<void> => {
    await fetchSystemSettings();
    toast.info("System settings refreshed");
  }, [fetchSystemSettings]);

  // Handle file upload for logo/favicon
  const handleFileUpload = useCallback(
    async (file: File, type: "company_logo" | "company_favicon") => {
      if (!file) return;
      // basic validations
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      try {
        const formData = new FormData();
        formData.append(type, file);

        const response = (await systemSettingsAPI.saveSettings(
          formData
        )) as ApiResponse<Partial<SystemSettings>>;

        if (response?.success && response.data) {
          // response.data[type] may be a string URL. Use a runtime cast.
          const returnedUrl = (response.data as any)[type] as string | undefined;
          if (returnedUrl) {
            setSystemSettings((prev) => ({
              ...(prev || ({} as SystemSettings)),
              [type]: `${returnedUrl}?t=${Date.now()}`,
            }));
            toast.success(
              `${type === "company_logo" ? "Logo" : "Favicon"} updated successfully`
            );
          } else {
            // If API succeeded but didn't return url, just refresh
            await fetchSystemSettings();
            toast.success(
              `${type === "company_logo" ? "Logo" : "Favicon"} updated successfully`
            );
          }
        } else {
          toast.error("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file");
      }
    },
    [fetchSystemSettings]
  );

  // Remove uploaded file
  const handleFileRemove = useCallback(
    (type: "company_logo" | "company_favicon") => {
      setSystemSettings((prev) => ({
        ...(prev || ({} as SystemSettings)),
        // set to undefined to indicate it's removed; interface allows optional
        [type]: undefined,
      }));
      toast.info(
        `${type === "company_logo" ? "Logo" : "Favicon"} removed from settings`
      );
    },
    []
  );

  const value: SystemSettingsContextType = {
    systemSettings,
    loading,
    saving,
    updateSystemSettings,
    saveSystemSettings,
    refreshSystemSettings,
    handleFileUpload,
    handleFileRemove,
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export { SystemSettingsContext };

/**
 * Convenience hook for branding values
 */
export const useCompanyBranding = () => {
  const { systemSettings } = useSystemSettings();

  return {
    companyName: systemSettings?.company_name,
    companyLogo: systemSettings?.company_logo,
    companyFavicon: systemSettings?.company_favicon,
    primaryColor: systemSettings?.primary_color ?? "#3B82F6",
    secondaryColor: systemSettings?.secondary_color ?? "#10B981",
  };
};

export type {  SystemSettingsContextType };
