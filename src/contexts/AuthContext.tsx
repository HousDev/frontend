// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import { authAPI } from "@/lib/api";

// interface User {
//   id: string;
//   username: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   role: "admin" | "manager" | "agent" | "seller" | "buyer";
//   phone?: string;
//   avatar?: string;
//   is_active: boolean;
// }

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (credentials: { username: string; password: string }) => Promise<void>;
//   register: (userData: {
//     username: string;
//     email: string;
//     password: string;
//     first_name: string;
//     last_name: string;
//     phone?: string;
//     role?: string;
//   }) => Promise<void>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
//   hasRole: (roles: string | string[]) => boolean;
//   updateUser: (updatedUser: Partial<User>) => void; // ✅ added
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   // ✅ Initialize auth state from localStorage
//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const storedUser = localStorage.getItem("user");

//         if (token && storedUser) {
//           const userData = JSON.parse(storedUser);
//           setUser(userData);
//         }
//       } catch (error) {
//         console.error("Auth initialization error:", error);
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);

//   // ✅ Login function
//   const login = async (credentials: { username: string; password: string }) => {
//     try {
//       const response = await authAPI.login(credentials);

//       if (response.success && response.data) {
//         const { user: userData, accessToken } = response.data;

//         localStorage.setItem("token", accessToken);
//         localStorage.setItem("user", JSON.stringify(userData));

//         setUser(userData);
//       } else {
//         throw new Error(response.message || "Login failed");
//       }
//     } catch (error: any) {
//       console.error("❌ [LOGIN] Error:", error);
//       throw new Error(
//         error.response?.data?.message || error.message || "Login failed"
//       );
//     }
//   };

//   // ✅ Register function
//   const register = async (userData: {
//     username: string;
//     email: string;
//     password: string;
//     first_name: string;
//     last_name: string;
//     phone?: string;
//     role?: string;
//   }) => {
//     try {
//       const response = await authAPI.register(userData);

//       if (response.success && response.data) {
//         const { user: newUser, accessToken } = response.data;

//         localStorage.setItem("token", accessToken);
//         localStorage.setItem("user", JSON.stringify(newUser));
//         setUser(newUser);
//       } else {
//         throw new Error(response.message || "Registration failed");
//       }
//     } catch (error: any) {
//       console.error("❌ [REGISTER] Error:", error);
//       throw new Error(
//         error.response?.data?.message ||
//         error.message ||
//         "Registration failed"
//       );
//     }
//   };

//   // ✅ Logout function (⚡ systemSettings ko clear nahi karna)
//   const logout = async () => {
//     try {
//       await authAPI.logout();
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       setUser(null);
//       // ⚠️ systemSettings ko deliberately clear nahi kiya
//     }
//   };

//   // ✅ Role checker
//   const hasRole = (roles: string | string[]): boolean => {
//     if (!user) return false;
//     const allowedRoles = Array.isArray(roles) ? roles : [roles];
//     return allowedRoles.includes(user.role);
//   };

//   // ✅ Update user globally (e.g. after profile/avatar update)
//   const updateUser = (updatedUser: Partial<User>) => {
//     setUser((prev) => {
//       if (!prev) return prev;

//       const newUser = { ...prev, ...updatedUser };

//       // Save updated user in localStorage
//       localStorage.setItem("user", JSON.stringify(newUser));

//       return newUser;
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
//     updateUser, // ✅ now available in context
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export default AuthProvider;




import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authAPI } from "@/lib/api";

// Updated User interface to match backend data structure
export interface User {
  id: string | number;
  username?: string;
  email: string;
  first_name: string;
  last_name: string;
  salutation?: string;
  // More flexible role type to handle all possible roles
  role: string; // Changed from restricted union type
  phone?: string;
  avatar?: string;
  designation?: string;
  department?: string;
  is_active: boolean;
  buyer_id?: string | number | null;
  seller_id?: string | number | null;
  created_at?: string;
  last_login?: string;
  dob?: string;
  blood_group?: string;
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
  refreshUser: () => Promise<void>; // Add refresh functionality
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

  // Enhanced user validation
  const validateAndNormalizeUser = (userData: any): User | null => {
    if (!userData || typeof userData !== 'object') return null;
    
    try {
      return {
        id: userData.id,
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        salutation: userData.salutation || '',
        role: String(userData.role || '').toLowerCase(), // Normalize role
        phone: userData.phone || '',
        avatar: userData.avatar || '',
        designation: userData.designation || '',
        department: userData.department || '',
        is_active: Boolean(userData.is_active),
        buyer_id: userData.buyer_id || null,
        seller_id: userData.seller_id || null,
        created_at: userData.created_at || '',
        last_login: userData.last_login || '',
        dob: userData.dob || '',
        blood_group: userData.blood_group || '',
      };
    } catch (error) {
      console.error('Error validating user data:', error);
      return null;
    }
  };

  // Initialize auth state from localStorage
useEffect(() => {
  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (token && storedUser) {
        const userData = JSON.parse(storedUser);
        const validatedUser = validateAndNormalizeUser(userData);
        
        if (validatedUser) {
          setUser(validatedUser);
        } else {
          // Invalid user data, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };
  
  initializeAuth();
}, []);


  // Refresh user data from server
  const refreshUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Call a refresh endpoint if available, otherwise use profile endpoint
      const response = await authAPI.getCurrentUser?.() || await authAPI.getProfile?.();
      if (response?.success && response.data) {
        const validatedUser = validateAndNormalizeUser(response.data);
        if (validatedUser) {
          setUser(validatedUser);
          localStorage.setItem("user", JSON.stringify(validatedUser));
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Enhanced login function
  const login = async (credentials: { username: string; password: string }): Promise<User> => {
    try {
      console.log('Attempting login for:', credentials.username);
      const response = await authAPI.login(credentials);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Login failed");
      }

      const { user: userData, accessToken } = response.data;
      console.log('Login response user data:', userData);

      const validatedUser = validateAndNormalizeUser(userData);
      if (!validatedUser) {
        throw new Error("Invalid user data received from server");
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(validatedUser));
      setUser(validatedUser);

      console.log('Login successful for user:', {
        id: validatedUser.id,
        role: validatedUser.role,
        buyer_id: validatedUser.buyer_id,
        seller_id: validatedUser.seller_id
      });

      return validatedUser;
    } catch (error: any) {
      console.error("❌ [LOGIN] Error:", error);
      throw new Error(error?.response?.data?.message || error.message || "Login failed");
    }
  };

  // Enhanced register function
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
      console.log('Attempting registration for:', userData.username);
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

      console.log('Registration successful for user:', {
        id: validatedUser.id,
        role: validatedUser.role,
        buyer_id: validatedUser.buyer_id,
        seller_id: validatedUser.seller_id
      });

      return validatedUser;
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      console.log('User logged out');
    }
  };

  // Enhanced role checker with hierarchy support
  const hasRole = (roles: string | string[]): boolean => {
    if (!user || !user.role) return false;
    
    const userRole = user.role.toLowerCase();
    const allowedRoles = Array.isArray(roles) 
      ? roles.map(r => r.toLowerCase()) 
      : [roles.toLowerCase()];
    
    // Check direct role match first
    if (allowedRoles.includes(userRole)) return true;
    
    // Check role hierarchy (admin can access everything)
    if (userRole === 'admin') return true;
    
    // Manager can access agent/executive roles
    if (userRole === 'manager' && allowedRoles.some(r => ['agent', 'executive'].includes(r))) {
      return true;
    }
    
    // Executive can access agent roles
    if (userRole === 'executive' && allowedRoles.includes('agent')) {
      return true;
    }
    
    return false;
  };

  // Enhanced update user function
  const updateUser = (updatedUser: Partial<User>): void => {
    setUser(prev => {
      if (!prev) return prev;
      
      const newUser = { ...prev, ...updatedUser };
      const validatedUser = validateAndNormalizeUser(newUser);
      
      if (validatedUser) {
        localStorage.setItem("user", JSON.stringify(validatedUser));
        console.log('User updated:', {
          id: validatedUser.id,
          role: validatedUser.role,
          buyer_id: validatedUser.buyer_id,
          seller_id: validatedUser.seller_id
        });
        return validatedUser;
      }
      
      return prev;
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
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;