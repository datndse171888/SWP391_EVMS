Thư mục `src/contexts` có chức năng chứa **React Contexts** - một pattern để quản lý và chia sẻ state toàn cục (global state) trong ứng dụng React. Đây là các chức năng chính:

## Chức năng của `src/contexts`:

### 1. **Quản lý State Toàn Cục**
- Chia sẻ dữ liệu giữa các component mà không cần prop drilling
- Quản lý state có phạm vi ứng dụng (authentication, theme, user data, etc.)

### 2. **Authentication Context**
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../utils/Axios';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'technician' | 'customer';
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Verify token and get user data
        const response = await authApi.getProfile();
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      const { accessToken, refreshToken, user } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      await authApi.register(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 3. **Theme Context**
```typescript
// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### 4. **Notification/Toast Context**
```typescript
// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notificationData: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const notification: Notification = { ...notificationData, id };
    
    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const value: NotificationContextType = {
    notifications,
    showNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
```

### 5. **App Context (Tổng hợp)**
```typescript
// src/contexts/AppContext.tsx
import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
```

## Cách sử dụng trong ứng dụng:

### 1. **Wrap App với Providers**
```typescript
// src/main.tsx hoặc src/App.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './contexts/AppContext';
import { Router } from './Router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <Router />
    </AppProvider>
  </React.StrictMode>,
);
```

### 2. **Sử dụng trong Components**
```typescript
// src/pages/authentication/Login.tsx
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { showNotification } = useNotification();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      showNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back!',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Login Failed',
        message: 'Invalid credentials',
      });
    }
  };

  // Component JSX...
};
```

## Lợi ích của Contexts:

1. **Tránh Prop Drilling**: Không cần truyền props qua nhiều tầng component
2. **Global State Management**: Quản lý state có phạm vi toàn ứng dụng
3. **Separation of Concerns**: Tách biệt logic state khỏi UI components
4. **Reusability**: Có thể sử dụng lại logic trong nhiều component
5. **Type Safety**: TypeScript hỗ trợ type checking cho contexts

Thư mục `contexts` giúp tổ chức và quản lý state toàn cục một cách hiệu quả trong ứng dụng React.