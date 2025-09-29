Thư mục `src/hooks` có chức năng chứa **Custom React Hooks** - những function tùy chỉnh để tái sử dụng logic state và side effects giữa các components. Đây là các chức năng chính:

## Chức năng của `src/hooks`:

### 1. **Tái sử dụng Logic State**
- Tách logic phức tạp khỏi components
- Chia sẻ logic giữa nhiều components
- Tạo ra abstraction layer cho business logic

### 2. **Authentication Hooks**
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authApi } from '../utils/Axios';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await authApi.getProfile();
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      const { accessToken, user } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
  };
};
```

### 3. **API Data Fetching Hooks**
```typescript
// src/hooks/useApi.ts
import { useState, useEffect } from 'react';
import { api } from '../utils/Axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T>(url: string, options?: { immediate?: boolean }) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await api.get<T>(url);
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.response?.data?.message || error.message,
      });
    }
  };

  useEffect(() => {
    if (options?.immediate !== false) {
      fetchData();
    }
  }, [url]);

  const refetch = () => fetchData();

  return {
    ...state,
    refetch,
  };
};

// src/hooks/useUsers.ts
export const useUsers = () => {
  const { data, loading, error, refetch } = useApi<User[]>('/users');
  
  return {
    users: data || [],
    loading,
    error,
    refetchUsers: refetch,
  };
};
```

### 4. **Form Handling Hooks**
```typescript
// src/hooks/useForm.ts
import { useState, ChangeEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof T]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
};
```

### 5. **Local Storage Hooks**
```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

// src/hooks/useTheme.ts
export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
};
```

### 6. **Debounce Hook**
```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// src/hooks/useSearch.ts
export const useSearch = (searchFn: (query: string) => Promise<any[]>) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      setLoading(true);
      searchFn(debouncedQuery)
        .then(setResults)
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [debouncedQuery, searchFn]);

  return { query, setQuery, results, loading };
};
```

### 7. **Modal/Toast Hooks**
```typescript
// src/hooks/useModal.ts
import { useState } from 'react';

export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

// src/hooks/useToast.ts
import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
};
```

## Cách sử dụng Hooks trong Components:

```typescript
// src/pages/authentication/Login.tsx
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { useToast } from '../../hooks/useToast';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();

  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors: any = {};
      if (!values.email) errors.email = 'Email is required';
      if (!values.password) errors.password = 'Password is required';
      return errors;
    },
    onSubmit: async (values) => {
      try {
        await login(values.email, values.password);
        showToast('Login successful!', 'success');
      } catch (error) {
        showToast('Login failed', 'error');
      }
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}
      
      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password}</span>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

## Lợi ích của Custom Hooks:

1. **Reusability**: Tái sử dụng logic giữa nhiều components
2. **Separation of Concerns**: Tách logic khỏi UI
3. **Testability**: Dễ dàng unit test logic riêng biệt
4. **Maintainability**: Dễ bảo trì và cập nhật
5. **Composition**: Có thể kết hợp nhiều hooks với nhau
6. **Type Safety**: TypeScript support đầy đủ

Thư mục `hooks` giúp tổ chức và tái sử dụng logic business một cách hiệu quả trong ứng dụng React.