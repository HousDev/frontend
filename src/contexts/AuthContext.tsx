// import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
// import { authAPI } from "@/lib/api";
// import { useSystemSettings } from "@/contexts/SystemSettingsContext";
// import { clearLocalStorage } from "@/utils/clearLocalStorage";

// // Updated User interface to match backend data structure
// export interface User {
//   id: string | number;
//   username?: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   salutation?: string;
//   // More flexible role type to handle all possible roles
//   role: string; // Changed from restricted union type
//   phone?: string;
//   avatar?: string;
//   designation?: string;
//   department?: string;
//   is_active: boolean;
//   buyer_id?: string | number | null;
//   seller_id?: string | number | null;
//   created_at?: string;
//   last_login?: string;
//   dob?: string;
//   blood_group?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (credentials: { username: string; password: string }) => Promise<User>;
//   register: (userData: {
//     username: string;
//     email: string;
//     password: string;
//     first_name: string;
//     last_name: string;
//     phone?: string;
//     role?: string;
//   }) => Promise<User>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
//   hasRole: (roles: string | string[]) => boolean;
//   updateUser: (updatedUser: Partial<User>) => void;
//   refreshUser: () => Promise<void>; // Add refresh functionality
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within an AuthProvider");
//   return context;
// };

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   // ✅ SystemSettings context (for clearing on logout)
//   const { clearSettings } = useSystemSettings();

//   // Initialize auth state from localStorage
//   useEffect(() => {
//     const initializeAuth = () => {
//       try {
//         const token = localStorage.getItem("token");
//         const storedUser = localStorage.getItem("user");
//         if (token && storedUser) {
//           setUser(JSON.parse(storedUser));
//         }
//       } catch (error) {
//         console.error("Auth initialization error:", error);
//         clearLocalStorage(); // ✅ clear corrupted data at once
//         clearSettings();
//       } finally {
//         setLoading(false);
//       }
//     };
//     initializeAuth();
//   }, [clearSettings]);
//   // Enhanced user validation
//   const validateAndNormalizeUser = (userData: any): User | null => {
//     if (!userData || typeof userData !== 'object') return null;
    
//     try {
//       return {
//         id: userData.id,
//         username: userData.username || '',
//         email: userData.email || '',
//         first_name: userData.first_name || '',
//         last_name: userData.last_name || '',
//         salutation: userData.salutation || '',
//         role: String(userData.role || '').toLowerCase(), // Normalize role
//         phone: userData.phone || '',
//         avatar: userData.avatar || '',
//         designation: userData.designation || '',
//         department: userData.department || '',
//         is_active: Boolean(userData.is_active),
//         buyer_id: userData.buyer_id || null,
//         seller_id: userData.seller_id || null,
//         created_at: userData.created_at || '',
//         last_login: userData.last_login || '',
//         dob: userData.dob || '',
//         blood_group: userData.blood_group || '',
//       };
//     } catch (error) {
//       console.error('Error validating user data:', error);
//       return null;
//     }
//   };

//   // Initialize auth state from localStorage
// useEffect(() => {
//   const initializeAuth = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const storedUser = localStorage.getItem("user");
      
//       if (token && storedUser) {
//         const userData = JSON.parse(storedUser);
//         const validatedUser = validateAndNormalizeUser(userData);
        
//         if (validatedUser) {
//           setUser(validatedUser);
//         } else {
//           // Invalid user data, clear storage
//           localStorage.removeItem("token");
//           localStorage.removeItem("user");
//         }
//       }
//     } catch (error) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   initializeAuth();
// }, []);


//   // Refresh user data from server
//   const refreshUser = async (): Promise<void> => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       // Call a refresh endpoint if available, otherwise use profile endpoint
//       const response = await authAPI.getCurrentUser?.() || await authAPI.getProfile?.();
//       if (response?.success && response.data) {
//         const validatedUser = validateAndNormalizeUser(response.data);
//         if (validatedUser) {
//           setUser(validatedUser);
//           localStorage.setItem("user", JSON.stringify(validatedUser));
//         }
//       }
//     } catch (error) {
//       console.error('Error refreshing user:', error);
//     }
//   };

//   // Enhanced login function
//   const login = async (credentials: { username: string; password: string }): Promise<User> => {
//     try {
      
//       const response = await authAPI.login(credentials);
      
//       if (!response.success || !response.data) {
//         throw new Error(response.message || "Login failed");
//       }

//       const { user: userData, accessToken } = response.data;
      

//       const validatedUser = validateAndNormalizeUser(userData);
//       if (!validatedUser) {
//         throw new Error("Invalid user data received from server");
//       }

//       localStorage.setItem("token", accessToken);
//       localStorage.setItem("user", JSON.stringify(validatedUser));
//       setUser(validatedUser);

     

//       return validatedUser;
//     } catch (error: any) {
//       console.error("❌ [LOGIN] Error:", error);
//       throw new Error(error?.response?.data?.message || error.message || "Login failed");
//     }
//   };

//   // Enhanced register function
//   const register = async (userData: {
//     username: string;
//     email: string;
//     password: string;
//     first_name: string;
//     last_name: string;
//     phone?: string;
//     role?: string;
//   }): Promise<User> => {
//     try {
     
//       const response = await authAPI.register(userData);
      
//       if (!response.success || !response.data) {
//         throw new Error(response.message || "Registration failed");
//       }

//       const { user: newUserData, accessToken } = response.data;
//       const validatedUser = validateAndNormalizeUser(newUserData);
      
//       if (!validatedUser) {
//         throw new Error("Invalid user data received from server");
//       }

//       localStorage.setItem("token", accessToken);
//       localStorage.setItem("user", JSON.stringify(validatedUser));
//       setUser(validatedUser);
//       return validatedUser;
//     } catch (error: any) {
//       console.error("❌ [REGISTER] Error:", error);
//       throw new Error(error?.response?.data?.message || error.message || "Registration failed");
//     }
//   };

//   // Logout function
//   const logout = async (): Promise<void> => {
//     try {
//       await authAPI.logout();
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       clearLocalStorage();   // ✅ sab keys ek jagah se clear
//       clearSettings();       // ✅ SystemSettings context bhi reset
//       setUser(null);
     
//     }
//   };

//   // Enhanced role checker with hierarchy support
//   const hasRole = (roles: string | string[]): boolean => {
//     if (!user || !user.role) return false;
    
//     const userRole = user.role.toLowerCase();
//     const allowedRoles = Array.isArray(roles)
//       ? roles.map(r => r.toLowerCase())
//       : [roles.toLowerCase()];
    
//     // Check direct role match first
//     if (allowedRoles.includes(userRole)) return true;
    
//     // Check role hierarchy (admin can access everything)
//     if (userRole === 'admin') return true;
    
//     // Manager can access agent/executive roles
//     if (userRole === 'manager' && allowedRoles.some(r => ['agent', 'executive'].includes(r))) {
//       return true;
//     }
    
//     // Executive can access agent roles
//     if (userRole === 'executive' && allowedRoles.includes('agent')) {
//       return true;
//     }
    
//     return false;
//   };

//   // Enhanced update user function
//   const updateUser = (updatedUser: Partial<User>): void => {
//     setUser(prev => {
//       if (!prev) return prev;
      
//       const newUser = { ...prev, ...updatedUser };
//       const validatedUser = validateAndNormalizeUser(newUser);
      
//       if (validatedUser) {
//         localStorage.setItem("user", JSON.stringify(validatedUser));
//         return validatedUser;
//       }
      
//       return prev;
//     });
//   };

//   const value: AuthContextType = {
//     user,
//     loading,
//     login,
//     register,
//     logout,
//     isAuthenticated: !!user,
//     hasRole,
//     updateUser,
//     refreshUser,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export default AuthProvider;

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authAPI } from "@/lib/api";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { clearLocalStorage } from "@/utils/clearLocalStorage";

/* ---------------------- Types for permissions ---------------------- */

export interface ModulePermissions {
  [resource: string]: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    view?: boolean;
    manage?: boolean;
    export?: boolean;
    import?: boolean;
  };
}

// Updated User interface to match backend data structure + permissions
export interface User {
  id: string | number;
  username?: string;
  email: string;
  first_name: string;
  last_name: string;
  salutation?: string;
  role: string; // dynamic role string
  phone?: string;
  avatar?: string;
  designation?: string;
  department?: string;
  is_active: boolean;
  buyer_id?: string | number | null;
  seller_id?: string | number | null;
  owner_id?: string | number | null;
  tenant_id?: string | number | null;
  created_at?: string;
  last_login?: string;
  dob?: string;
  blood_group?: string;
  // 🔹 RBAC module permissions JSON from backend
  module_permissions?: ModulePermissions;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: {
    username: string;
    password: string;
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    device_id?: string;
    source?: string;
  }) => Promise<User>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  setAuthSession: (userData: any, accessToken: string, session_id?: string) => User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultAuthContext: AuthContextType = {
  user: (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  })(),
  loading: false,
  login: async () => { throw new Error("AuthProvider not found"); },
  register: async () => { throw new Error("AuthProvider not found"); },
  logout: async () => { localStorage.clear(); window.location.href = "/login"; },
  isAuthenticated: Boolean(localStorage.getItem("token")),
  hasRole: () => true,
  updateUser: () => {},
  refreshUser: async () => {},
  setAuthSession: () => null,
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) return defaultAuthContext;
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ SystemSettings context (for clearing on logout and dynamic inactivity timeout)
  const { systemSettings, clearSettings } = useSystemSettings();

  /* ----------------- Helper: normalize + validate user ----------------- */

  const validateAndNormalizeUser = (userData: any): User | null => {
    if (!userData || typeof userData !== "object") return null;

    let modulePermissions: ModulePermissions = {};

    try {
      if (userData.module_permissions) {
        if (typeof userData.module_permissions === "string") {
          try {
            modulePermissions = JSON.parse(userData.module_permissions);
          } catch (e) {
            console.warn("Failed to parse module_permissions JSON:", e);
            modulePermissions = {};
          }
        } else if (
          typeof userData.module_permissions === "object" &&
          userData.module_permissions !== null
        ) {
          modulePermissions = userData.module_permissions;
        }
      }
    } catch (e) {
      console.warn("Error handling module_permissions:", e);
      modulePermissions = {};
    }

    try {
      return {
        id: userData.id,
        username: userData.username || "",
        email: userData.email || "",
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        salutation: userData.salutation || "",
        role: String(userData.role || "").toLowerCase(), // normalize role
        phone: userData.phone || "",
        avatar: userData.avatar || "",
        designation: userData.designation || "",
        department: userData.department || "",
        is_active: Boolean(userData.is_active),
        buyer_id: userData.buyer_id ?? null,
        seller_id: userData.seller_id ?? null,
        owner_id: userData.owner_id ?? null,
        tenant_id: userData.tenant_id ?? null,
        created_at: userData.created_at || "",
        last_login: userData.last_login || "",
        dob: userData.dob || "",
        blood_group: userData.blood_group || "",
        module_permissions: modulePermissions,
      };
    } catch (error) {
      console.error("Error validating user data:", error);
      return null;
    }
  };

  /* ----------------- Initialize auth state from localStorage + backend refresh ----------------- */

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      clearLocalStorage();
      clearSettings();
    };

    window.addEventListener("auth_logout", handleAuthLogout);
    window.addEventListener("storage", (e) => {
      if (e.key === "token" && !e.newValue) {
        handleAuthLogout();
      }
    });

    return () => {
      window.removeEventListener("auth_logout", handleAuthLogout);
    };
  }, [clearSettings]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          // 1) Local user parse
          const parsed = JSON.parse(storedUser);
          const validatedLocal = validateAndNormalizeUser(parsed);

          if (validatedLocal) {
            setUser(validatedLocal);
          } else {
            // invalid local user -> clear
            clearLocalStorage();
            clearSettings();
            setUser(null);
            setLoading(false);
            return;
          }

          // 2) Backend se fresh user validation
          try {
            const response =
              (authAPI.getCurrentUser && (await authAPI.getCurrentUser())) ||
              (authAPI.getProfile && (await authAPI.getProfile()));

            if (response?.success && response.data) {
              const validatedRemote = validateAndNormalizeUser(response.data);
              if (validatedRemote) {
                setUser(validatedRemote);
                localStorage.setItem(
                  "user",
                  JSON.stringify(validatedRemote)
                );
              }
            } else {
              // Remote rejected
              clearLocalStorage();
              clearSettings();
              setUser(null);
            }
          } catch (e: any) {
            console.warn("User validation failed:", e);
            if (e?.response?.status === 401 || e?.response?.status === 403 || e?.response?.status === 404) {
              clearLocalStorage();
              clearSettings();
              setUser(null);
            }
          }
        } else {
          // no token or user
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearLocalStorage();
        clearSettings();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [clearSettings]);

  /* ----------------- Dynamic Inactivity Auto-Logout ----------------- */
  useEffect(() => {
    if (!user) return;

    // Check if inactivity logout is enabled (defaults to true)
    const isEnabled = systemSettings?.enable_inactivity_logout !== false;
    if (!isEnabled) {
      return;
    }

    const timeoutMinutes = Math.max(1, Number(systemSettings?.inactivity_timeout_minutes) || 15);
    const INACTIVITY_LIMIT_MS = timeoutMinutes * 60 * 1000;
    let timer: NodeJS.Timeout;

    const performAutoLogout = async () => {
      console.warn(`⚠️ [AUTO-LOGOUT] User inactive for ${timeoutMinutes} minutes. Logging out...`);
      sessionStorage.setItem(
        "logout_reason",
        `You were automatically logged out due to ${timeoutMinutes} minutes of inactivity.`
      );
      try {
        await authAPI.logout();
      } catch (e) {
        console.error("Auto-logout API call failed:", e);
      } finally {
        clearLocalStorage();
        clearSettings();
        setUser(null);
        window.location.href = "/login?reason=inactivity";
      }
    };

    const resetInactivityTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(performAutoLogout, INACTIVITY_LIMIT_MS);
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Initial timer start
    resetInactivityTimer();

    // Attach active user interaction event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [
    user,
    systemSettings?.enable_inactivity_logout,
    systemSettings?.inactivity_timeout_minutes,
    clearSettings,
  ]);

  /* ----------------- Refresh user data from server ----------------- */

  const refreshUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response =
        (authAPI.getCurrentUser && (await authAPI.getCurrentUser())) ||
        (authAPI.getProfile && (await authAPI.getProfile()));

      if (response?.success && response.data) {
        const validatedUser = validateAndNormalizeUser(response.data);
        if (validatedUser) {
          setUser(validatedUser);
          localStorage.setItem("user", JSON.stringify(validatedUser));
        }
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  /* ----------------- Login ----------------- */

  const login = async (credentials: {
    username: string;
    password: string;
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    device_id?: string;
    source?: string;
  }): Promise<User> => {
    try {
      const response = await authAPI.login(credentials);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Login failed");
      }

      const { user: userData, accessToken, session_id } = response.data;

      const validatedUser = validateAndNormalizeUser(userData);
      if (!validatedUser) {
        throw new Error("Invalid user data received from server");
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(validatedUser));
      if (session_id) {
        localStorage.setItem("session_id", session_id);
      }
      setUser(validatedUser);

      return validatedUser;
    } catch (error: any) {
      console.error("❌ [LOGIN] Error:", error);
     throw new Error(
  error?.response?.data?.message || error?.message || "Login failed"
);

    }
  };

  /* ----------------- Register ----------------- */

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
  }): Promise<User> => {
    try {
      const response = await authAPI.register(userData);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Registration failed");
      }

      const { user: newUserData, accessToken } = response.data;
      const validatedUser = validateAndNormalizeUser(newUserData);

      if (!validatedUser) {
        throw new Error("Invalid user data received from server");
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(validatedUser));
      setUser(validatedUser);
      return validatedUser;
    } catch (error: any) {
      console.error("❌ [REGISTER] Error:", error);
      throw new Error(
        error?.response?.data?.message ||
        error.message ||
        "Registration failed"
      );
    }
  };

  /* ----------------- Logout ----------------- */

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearLocalStorage();
      clearSettings();
      setUser(null);
    }
  };

  /* ----------------- Role checker (hierarchy) ----------------- */

  const hasRole = (roles: string | string[]): boolean => {
    if (!user || !user.role) return false;

    const userRole = user.role.toLowerCase();
    const allowedRoles = Array.isArray(roles)
      ? roles.map((r) => r.toLowerCase())
      : [roles.toLowerCase()];

    // Direct match
    if (allowedRoles.includes(userRole)) return true;

    // Admin can access everything
    if (userRole === "admin") return true;

    // Manager can access agent/executive roles
    if (
      userRole === "manager" &&
      allowedRoles.some((r) => ["agent", "executive"].includes(r))
    ) {
      return true;
    }

    // Executive can access agent roles
    if (userRole === "executive" && allowedRoles.includes("agent")) {
      return true;
    }

    return false;
  };

  /* ----------------- Update user in state + localStorage ----------------- */

  const updateUser = (updatedUser: Partial<User>): void => {
    setUser((prev) => {
      if (!prev) return prev;

      const merged = { ...prev, ...updatedUser };
      const validatedUser = validateAndNormalizeUser(merged);

      if (validatedUser) {
        localStorage.setItem("user", JSON.stringify(validatedUser));
        return validatedUser;
      }

      return prev;
    });
  };

  const setAuthSession = (userData: any, accessToken: string, session_id?: string): User | null => {
    const validatedUser = validateAndNormalizeUser(userData);
    if (validatedUser) {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(validatedUser));
      if (session_id) {
        localStorage.setItem("session_id", session_id);
      }
      setUser(validatedUser);
      return validatedUser;
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasRole,
    updateUser,
    refreshUser,
    setAuthSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
