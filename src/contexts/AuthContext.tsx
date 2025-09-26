import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authAPI } from "@/lib/api";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { clearLocalStorage } from "@/utils/clearLocalStorage"; 

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "manager" | "agent" | "buyer" | "seller";
  phone?: string;
  avatar?: string;
  is_active: boolean;
  buyer_id?: string | number;
  seller_id?: string | number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<User>;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ SystemSettings context (for clearing on logout)
  const { clearSettings } = useSystemSettings();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearLocalStorage(); // ✅ clear corrupted data at once
        clearSettings();
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, [clearSettings]);

  // Login function
  const login = async (credentials: { username: string; password: string }): Promise<User> => {
    try {
      const response = await authAPI.login(credentials);
      if (!response.success || !response.data) throw new Error(response.message || "Login failed");

      const { user: userData, accessToken } = response.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return userData;
    } catch (error: any) {
      console.error("❌ [LOGIN] Error:", error);
      throw new Error(error?.response?.data?.message || error.message || "Login failed");
    }
  };

  // Register function
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
      if (!response.success || !response.data) throw new Error(response.message || "Registration failed");

      const { user: newUser, accessToken } = response.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);

      return newUser;
    } catch (error: any) {
      console.error("❌ [REGISTER] Error:", error);
      throw new Error(error?.response?.data?.message || error.message || "Registration failed");
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearLocalStorage();   // ✅ sab keys ek jagah se clear
      clearSettings();       // ✅ SystemSettings context bhi reset
      setUser(null);
    }
  };

  // Role checker (case-insensitive)
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles.map(r => r.toLowerCase()) : [roles.toLowerCase()];
    return allowedRoles.includes(user.role.toLowerCase());
  };

  // Update user globally
  const updateUser = (updatedUser: Partial<User>): void => {
    setUser(prev => {
      if (!prev) return prev;
      const newUser = { ...prev, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
