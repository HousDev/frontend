// // contexts/SystemSettingsContext.tsx
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
//   useCallback,
// } from "react";
// import { systemSettingsAPI } from "@/lib/systemSettingsAPI";
// import { toast } from "react-toastify";

// export interface SystemSettings {
//   company_name: string;
//   company_logo?: string;
//   company_favicon?: string;
//   primary_color: string;
//   secondary_color: string;
//   currency: string;
//   date_format: string;
//   time_format: string;
//   default_language: string;
//   max_file_size: number;
//   backup_frequency: string;
//   auto_assign_leads: boolean;
//   lead_scoring_enabled: boolean;
//   property_auto_approval: boolean;
// }

// interface SystemSettingsContextType {
//   systemSettings: SystemSettings | null;
//   loading: boolean;
//   saving: boolean;
//   error: string | null;
//   updateSystemSettings: (settings: Partial<SystemSettings>) => void;
//   saveSystemSettings: () => Promise<void>;
//   refreshSystemSettings: () => Promise<void>;
//   handleFileUpload: (
//     file: File,
//     type: "company_logo" | "company_favicon"
//   ) => Promise<void>;
//   handleFileRemove: (type: "company_logo" | "company_favicon") => void;
//   resetError: () => void;
// }

// interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   message?: string;
// }

// // Default system settings to prevent errors
// const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
//   company_name: "Your Company",
//   company_logo: "",
//   company_favicon: "",
//   primary_color: "#3B82F6",
//   secondary_color: "#10B981",
//   currency: "USD",
//   date_format: "MM/DD/YYYY",
//   time_format: "12",
//   default_language: "en",
//   max_file_size: 5242880, // 5MB
//   backup_frequency: "daily",
//   auto_assign_leads: true,
//   lead_scoring_enabled: true,
//   property_auto_approval: false,
// };

// const SystemSettingsContext = createContext<SystemSettingsContextType | null>(
//   null
// );

// export const useSystemSettings = (): SystemSettingsContextType => {
//   const context = useContext(SystemSettingsContext);
//   if (context === null) {
//     throw new Error(
//       "useSystemSettings must be used within a SystemSettingsProvider"
//     );
//   }
//   return context;
// };

// interface SystemSettingsProviderProps {
//   children: ReactNode;
// }

// // ---------- helpers ----------
// const getStoredSettings = (): SystemSettings | null => {
//   if (typeof window === "undefined") return null;
//   try {
//     const saved = window.localStorage?.getItem("systemSettings");
//     if (saved) {
//       const parsed = JSON.parse(saved) as SystemSettings;
//       if (parsed.company_name && parsed.primary_color) return parsed;
//     }
//   } catch (error) {
//     console.warn("Failed to parse stored system settings:", error);
//   }
//   return null;
// };

// const storeSettings = (settings: SystemSettings): void => {
//   if (typeof window === "undefined") return;
//   try {
//     window.localStorage?.setItem("systemSettings", JSON.stringify(settings));
//   } catch (error) {
//     console.warn("Failed to store system settings:", error);
//   }
// };

// // make relative /uploads paths absolute to current origin
// const toAbsolute = (url?: string) => {
//   if (!url) return url;
//   try {
//     return new URL(url, window.location.origin).toString();
//   } catch {
//     return url;
//   }
// };

// export const SystemSettingsProvider: React.FC<SystemSettingsProviderProps> = ({
//   children,
// }) => {
//   const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(
//     () => getStoredSettings() || DEFAULT_SYSTEM_SETTINGS
//   );
//   const [loading, setLoading] = useState<boolean>(false);
//   const [saving, setSaving] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // Persist settings to localStorage
//   useEffect(() => {
//     if (systemSettings) {
//       storeSettings(systemSettings);
//     }
//   }, [systemSettings]);

//   // Sync favicon + document title (handles unset)
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     try {
//       let link =
//         document.querySelector<HTMLLinkElement>("link[rel~='icon']") || null;
//       if (!link) {
//         link = document.createElement("link");
//         link.rel = "icon";
//         document.head.appendChild(link);
//       }
//       link.href = systemSettings?.company_favicon || "";

//       document.title =
//         systemSettings?.company_name || DEFAULT_SYSTEM_SETTINGS.company_name;
//     } catch (error) {
//       console.warn("Failed to update favicon/title:", error);
//     }
//   }, [systemSettings?.company_favicon, systemSettings?.company_name]);

//   // Reset error state
//   const resetError = useCallback(() => {
//     setError(null);
//   }, []);

//   // Fetch system settings from API with better error handling
//   const fetchSystemSettings = useCallback(async (): Promise<void> => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (
//         !systemSettingsAPI ||
//         typeof systemSettingsAPI.getSettings !== "function"
//       ) {
//         throw new Error("System settings API is not available");
//       }

//       const response = (await systemSettingsAPI.getSettings()) as ApiResponse<
//         SystemSettings
//       >;

//       if (response?.data) {
//         const mergedSettings: SystemSettings = {
//           ...DEFAULT_SYSTEM_SETTINGS,
//           ...response.data,
//         };
//         // normalize URLs to absolute
//         mergedSettings.company_logo = toAbsolute(mergedSettings.company_logo);
//         mergedSettings.company_favicon = toAbsolute(
//           mergedSettings.company_favicon
//         );

//         setSystemSettings(mergedSettings);
//         setError(null);
//       } else {
//         throw new Error(response?.message || "Failed to load system settings");
//       }
//     } catch (error: any) {
//       console.error("Error fetching system settings:", error);
//       const errorMessage = error?.message || "Failed to load system settings";
//       setError(errorMessage);

//       const storedSettings = getStoredSettings();
//       if (storedSettings) {
//         setSystemSettings(storedSettings);
//         toast.warn("Using cached system settings due to connection error");
//       } else {
//         setSystemSettings(DEFAULT_SYSTEM_SETTINGS);
//         toast.warn("Using default system settings due to connection error");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Initialize settings on mount  ✅ ALWAYS refresh
//   useEffect(() => {
//     const cached = getStoredSettings();
//     if (cached) setSystemSettings(cached); // fast paint
//     fetchSystemSettings(); // always try to refresh (works logged-out if public GET)
//   }, [fetchSystemSettings]);

//   // Update system settings locally (optimistic update)
//   const updateSystemSettings = useCallback(
//     (settings: Partial<SystemSettings>) => {
//       setSystemSettings((prevSettings) => ({
//         ...(prevSettings || DEFAULT_SYSTEM_SETTINGS),
//         ...settings,
//       }));
//       setError(null);
//     },
//     []
//   );

//   // Save system settings to API with better error handling
//   const saveSystemSettings = useCallback(async (): Promise<void> => {
//     if (!systemSettings) {
//       throw new Error("No system settings to save");
//     }

//     try {
//       setSaving(true);
//       setError(null);

//       if (
//         !systemSettingsAPI ||
//         typeof systemSettingsAPI.saveSettings !== "function"
//       ) {
//         throw new Error("System settings API is not available");
//       }

//       const formData = new FormData();

//       (Object.entries(systemSettings) as [keyof SystemSettings, any][]).forEach(
//         ([key, value]) => {
//           if (value !== undefined && value !== null) {
//             if (
//               typeof value === "string" ||
//               typeof value === "number" ||
//               typeof value === "boolean"
//             ) {
//               formData.append(String(key), String(value));
//             } else {
//               formData.append(String(key), JSON.stringify(value));
//             }
//           }
//         }
//       );

//       const response = (await systemSettingsAPI.saveSettings(
//         formData
//       )) as ApiResponse<SystemSettings>;

//       if (response?.success) {
//         if (response.data) {
//           const mergedSettings: SystemSettings = {
//             ...DEFAULT_SYSTEM_SETTINGS,
//             ...response.data,
//           };
//           mergedSettings.company_logo = toAbsolute(mergedSettings.company_logo);
//           mergedSettings.company_favicon = toAbsolute(
//             mergedSettings.company_favicon
//           );

//           setSystemSettings(mergedSettings);
//         }
//         toast.success("System settings updated successfully");
//         setError(null);
//       } else {
//         throw new Error(response?.message || "Failed to update system settings");
//       }
//     } catch (error: any) {
//       console.error("Error updating system settings:", error);
//       const errorMessage =
//         error?.response?.data?.message ||
//         error?.message ||
//         "Failed to update system settings";

//       setError(errorMessage);
//       toast.error(errorMessage);
//       throw error;
//     } finally {
//       setSaving(false);
//     }
//   }, [systemSettings]);

//   // Refresh system settings from API
//   const refreshSystemSettings = useCallback(async (): Promise<void> => {
//     try {
//       await fetchSystemSettings();
//       toast.success("System settings refreshed successfully");
//     } catch {
//       toast.error("Failed to refresh system settings");
//     }
//   }, [fetchSystemSettings]);

//   // Handle file upload for logo/favicon with better error handling
//   const handleFileUpload = useCallback(
//     async (file: File, type: "company_logo" | "company_favicon") => {
//       if (!file) return;

//       if (!file.type.startsWith("image/")) {
//         toast.error("Please upload a valid image file");
//         return;
//       }

//       const maxSize = systemSettings?.max_file_size || 5 * 1024 * 1024; // 5MB default
//       if (file.size > maxSize) {
//         toast.error(
//           `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`
//         );
//         return;
//       }

//       try {
//         setError(null);

//         if (
//           !systemSettingsAPI ||
//           typeof systemSettingsAPI.saveSettings !== "function"
//         ) {
//           throw new Error("System settings API is not available");
//         }

//         const formData = new FormData();
//         formData.append(type, file);

//         const response =
//           (await systemSettingsAPI.saveSettings(
//             formData
//           )) as ApiResponse<Partial<SystemSettings>>;

//         if (response?.success && response.data) {
//           const returnedUrl = (response.data as any)[type] as
//             | string
//             | undefined;

//           if (returnedUrl) {
//             setSystemSettings((prev) => ({
//               ...(prev || DEFAULT_SYSTEM_SETTINGS),
//               [type]: toAbsolute(`${returnedUrl}?t=${Date.now()}`),
//             }));
//             toast.success(
//               `${type === "company_logo" ? "Logo" : "Favicon"
//               } updated successfully`
//             );
//           } else {
//             await fetchSystemSettings();
//             toast.success(
//               `${type === "company_logo" ? "Logo" : "Favicon"
//               } updated successfully`
//             );
//           }
//         } else {
//           throw new Error(response?.message || "Failed to upload image");
//         }
//       } catch (error: any) {
//         console.error("Error uploading file:", error);
//         const errorMessage = error?.message || "Failed to upload file";
//         setError(errorMessage);
//         toast.error(errorMessage);
//       }
//     },
//     [systemSettings?.max_file_size, fetchSystemSettings]
//   );

//   // Remove uploaded file (set empty string for consistent shape)
//   const handleFileRemove = useCallback(
//     (type: "company_logo" | "company_favicon") => {
//       setSystemSettings((prev) => ({
//         ...(prev || DEFAULT_SYSTEM_SETTINGS),
//         [type]: "",
//       }));
//       toast.info(
//         `${type === "company_logo" ? "Logo" : "Favicon"} removed from settings`
//       );
//       setError(null);
//     },
//     []
//   );

//   const value: SystemSettingsContextType = {
//     systemSettings,
//     loading,
//     saving,
//     error,
//     updateSystemSettings,
//     saveSystemSettings,
//     refreshSystemSettings,
//     handleFileUpload,
//     handleFileRemove,
//     resetError,
//   };

//   return (
//     <SystemSettingsContext.Provider value={value}>
//       {children}
//     </SystemSettingsContext.Provider>
//   );
// };

// export { SystemSettingsContext };

// /**
//  * Convenience hook for branding values with fallbacks
//  */
// export const useCompanyBranding = () => {
//   const { systemSettings } = useSystemSettings();

//   return {
//     companyName:
//       systemSettings?.company_name || DEFAULT_SYSTEM_SETTINGS.company_name,
//     companyLogo:
//       systemSettings?.company_logo || DEFAULT_SYSTEM_SETTINGS.company_logo,
//     companyFavicon:
//       systemSettings?.company_favicon || DEFAULT_SYSTEM_SETTINGS.company_favicon,
//     primaryColor:
//       systemSettings?.primary_color || DEFAULT_SYSTEM_SETTINGS.primary_color,
//     secondaryColor:
//       systemSettings?.secondary_color || DEFAULT_SYSTEM_SETTINGS.secondary_color,
//   };
// };

// export type { SystemSettingsContextType };



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
  footer_logo?: string; // ✅ added
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
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  company_name: "Your Company",
  company_logo: "",
  footer_logo: "",
  company_favicon: "",
  primary_color: "#3B82F6",
  secondary_color: "#10B981",
  currency: "USD",
  date_format: "MM/DD/YYYY",
  time_format: "12",
  default_language: "en",
  max_file_size: 5242880, // 5MB
  backup_frequency: "daily",
  auto_assign_leads: true,
  lead_scoring_enabled: true,
  property_auto_approval: false,
};

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
    if (saved) {
      const parsed = JSON.parse(saved) as SystemSettings;
      if (parsed.company_name && parsed.primary_color) return parsed;
    }
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
    () => getStoredSettings() || DEFAULT_SYSTEM_SETTINGS
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (systemSettings) {
      storeSettings(systemSettings);
    }
  }, [systemSettings]);

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
      document.title =
        systemSettings?.company_name || DEFAULT_SYSTEM_SETTINGS.company_name;
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
        const mergedSettings: SystemSettings = {
          ...DEFAULT_SYSTEM_SETTINGS,
          ...response.data,
        };
        mergedSettings.company_logo = toAbsolute(mergedSettings.company_logo);
        mergedSettings.footer_logo = toAbsolute(mergedSettings.footer_logo);
        mergedSettings.company_favicon = toAbsolute(
          mergedSettings.company_favicon
        );

        setSystemSettings(mergedSettings);
        setError(null);
      } else {
        throw new Error(response?.message || "Failed to load system settings");
      }
    } catch (error: any) {
      console.error("Error fetching system settings:", error);
      const errorMessage = error?.message || "Failed to load system settings";
      setError(errorMessage);

      const storedSettings = getStoredSettings();
      if (storedSettings) {
        setSystemSettings(storedSettings);
        toast.warn("Using cached system settings due to connection error");
      } else {
        setSystemSettings(DEFAULT_SYSTEM_SETTINGS);
        toast.warn("Using default system settings due to connection error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getStoredSettings();
    if (cached) setSystemSettings(cached);
    fetchSystemSettings();
  }, [fetchSystemSettings]);

  const updateSystemSettings = useCallback(
    (settings: Partial<SystemSettings>) => {
      setSystemSettings((prevSettings) => ({
        ...(prevSettings || DEFAULT_SYSTEM_SETTINGS),
        ...settings,
      }));
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
      (Object.entries(systemSettings) as [keyof SystemSettings, any][]).forEach(
        ([key, value]) => {
          if (value !== undefined && value !== null) {
            if (
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean"
            ) {
              formData.append(String(key), String(value));
            } else {
              formData.append(String(key), JSON.stringify(value));
            }
          }
        }
      );

      const response = (await systemSettingsAPI.saveSettings(
        formData
      )) as ApiResponse<SystemSettings>;

      if (response?.success && response.data) {
        const mergedSettings: SystemSettings = {
          ...DEFAULT_SYSTEM_SETTINGS,
          ...response.data,
        };
        mergedSettings.company_logo = toAbsolute(mergedSettings.company_logo);
        mergedSettings.footer_logo = toAbsolute(mergedSettings.footer_logo);
        mergedSettings.company_favicon = toAbsolute(
          mergedSettings.company_favicon
        );
        setSystemSettings(mergedSettings);
        toast.success("System settings updated successfully");
        setError(null);
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
        setError(null);
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
              ...(prev || DEFAULT_SYSTEM_SETTINGS),
              [type]: toAbsolute(`${returnedUrl}?t=${Date.now()}`),
            }));
            toast.success(
              `${type.replace("_", " ")} updated successfully`
            );
          } else {
            await fetchSystemSettings();
            toast.success(
              `${type.replace("_", " ")} updated successfully`
            );
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
        ...(prev || DEFAULT_SYSTEM_SETTINGS),
        [type]: "",
      }));
      toast.info(`${type.replace("_", " ")} removed from settings`);
      setError(null);
    },
    []
  );

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
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export { SystemSettingsContext };
