import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authAPI } from "@/lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "manager" | "agent";
  phone?: string;
  avatar?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
  updateUser: (updatedUser: Partial<User>) => void; // ✅ added
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ Login function
  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await authAPI.login(credentials);

      if (response.success && response.data) {
        const { user: userData, accessToken } = response.data;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("❌ [LOGIN] Error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  };

  // ✅ Register function
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
  }) => {
    try {
      const response = await authAPI.register(userData);

      if (response.success && response.data) {
        const { user: newUser, accessToken } = response.data;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("❌ [REGISTER] Error:", error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Registration failed"
      );
    }
  };

  // ✅ Logout function (⚡ systemSettings ko clear nahi karna)
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      // ⚠️ systemSettings ko deliberately clear nahi kiya
    }
  };

  // ✅ Role checker
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  };

  // ✅ Update user globally (e.g. after profile/avatar update)
  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const newUser = { ...prev, ...updatedUser };

      // Save updated user in localStorage
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
    updateUser, // ✅ now available in context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
