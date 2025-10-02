import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../services/api/AuthApi';

// User interface
export interface User {
  id: string;
  email: string;
  userName: string;
  fullName?: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'admin' | 'staff' | 'technician' | 'customer';
  gender?: string;
  isDisabled: boolean;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (payload: { email: string; userName: string; photoURL?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      
      const { accessToken, user: userData } = response.data;
      
      // Store in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(accessToken);
      setUser(userData);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login function
  const loginWithGoogle = async (payload: { email: string; userName: string; photoURL?: string }): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApi.loginWithGoogle(payload);
      const { accessToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);
    } catch (error: any) {
      console.error('Google Login error:', error);
      throw new Error(error.response?.data?.message || 'Đăng nhập Google thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    // Clear state
    setToken(null);
    setUser(null);
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Check if user has specific role(s)
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // Check if user has specific permission
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;

    // Role permissions mapping
    const rolePermissions: Record<string, Record<string, string[]>> = {
      admin: {
        users: ['create', 'read', 'update', 'delete'],
        services: ['create', 'read', 'update', 'delete'],
        appointments: ['create', 'read', 'update', 'delete'],
        reports: ['create', 'read', 'update', 'delete'],
        system: ['read', 'update']
      },
      staff: {
        users: ['read', 'update'],
        services: ['create', 'read', 'update'],
        appointments: ['create', 'read', 'update'],
        reports: ['read']
      },
      technician: {
        services: ['read', 'update'],
        appointments: ['read', 'update'],
        profile: ['read', 'update']
      },
      customer: {
        profile: ['read', 'update'],
        appointments: ['create', 'read'],
        services: ['read']
      }
    };

    const userPermissions = rolePermissions[user.role];
    if (!userPermissions) return false;

    const resourcePermissions = userPermissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    updateUser,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
