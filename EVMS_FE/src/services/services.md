Thư mục `src/services` có chức năng chứa **Business Logic Layer** và **API Service Layer** - các function và class để xử lý logic nghiệp vụ và tương tác với backend APIs. Đây là các chức năng chính:

## Chức năng của `src/services`:

### 1. **API Service Layer**
- Tương tác với backend APIs
- Xử lý HTTP requests/responses
- Transform data giữa frontend và backend
- Error handling cho API calls

### 2. **Authentication Service**
```typescript
// src/services/authService.ts
import { api } from '../utils/Axios';
import { User, LoginCredentials, RegisterData } from '../types/auth';

export class AuthService {
  private static readonly TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);

      return { user, token: accessToken };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  static async register(userData: RegisterData): Promise<User> {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local tokens
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  static async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken } = response.data;

      localStorage.setItem(this.TOKEN_KEY, accessToken);
      return accessToken;
    } catch (error) {
      this.logout(); // Clear tokens if refresh fails
      throw error;
    }
  }

  static async getProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
```

### 3. **User Management Service**
```typescript
// src/services/userService.ts
import { api } from '../utils/Axios';
import { User, CreateUserData, UpdateUserData, UserFilters } from '../types/user';

export class UserService {
  static async getUsers(filters?: UserFilters): Promise<User[]> {
    try {
      const response = await api.get('/users', { params: filters });
      return response.data.users;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  static async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await api.post('/users', userData);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  }

  static async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  static async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await api.get('/users/search', { params: { q: query } });
      return response.data.users;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search users');
    }
  }
}
```

### 4. **Order/Event Service**
```typescript
// src/services/eventService.ts
import { api } from '../utils/Axios';
import { Event, CreateEventData, UpdateEventData, EventFilters } from '../types/event';

export class EventService {
  static async getEvents(filters?: EventFilters): Promise<Event[]> {
    try {
      const response = await api.get('/events', { params: filters });
      return response.data.events;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  }

  static async getEventById(id: string): Promise<Event> {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data.event;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
  }

  static async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      const response = await api.post('/events', eventData);
      return response.data.event;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  }

  static async updateEvent(id: string, eventData: UpdateEventData): Promise<Event> {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data.event;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  }

  static async deleteEvent(id: string): Promise<void> {
    try {
      await api.delete(`/events/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  }

  static async approveEvent(id: string): Promise<Event> {
    try {
      const response = await api.patch(`/events/${id}/approve`);
      return response.data.event;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve event');
    }
  }

  static async rejectEvent(id: string, reason: string): Promise<Event> {
    try {
      const response = await api.patch(`/events/${id}/reject`, { reason });
      return response.data.event;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject event');
    }
  }
}
```

### 5. **File Upload Service**
```typescript
// src/services/fileService.ts
import { api } from '../utils/Axios';

interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export class FileService {
  static async uploadFile(file: File, folder: string = 'general'): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await api.upload('/files/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Upload Progress: ${progress}%`);
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Upload failed');
    }
  }

  static async uploadMultipleFiles(files: File[], folder: string = 'general'): Promise<UploadResponse[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error: any) {
      throw new Error('Multiple file upload failed');
    }
  }

  static async deleteFile(filename: string): Promise<void> {
    try {
      await api.delete(`/files/${filename}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Delete file failed');
    }
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size too large (max 5MB)' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not supported' };
    }

    return { isValid: true };
  }
}
```

### 6. **Notification Service**
```typescript
// src/services/notificationService.ts
import { api } from '../utils/Axios';
import { Notification, CreateNotificationData } from '../types/notification';

export class NotificationService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications');
      return response.data.notifications;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }

  static async markAsRead(id: string): Promise<void> {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark as read');
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/read-all');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark all as read');
    }
  }

  static async deleteNotification(id: string): Promise<void> {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  }

  // Real-time notifications with WebSocket
  static connectWebSocket(userId: string): WebSocket {
    const ws = new WebSocket(`ws://localhost:8080/notifications/${userId}`);
    
    ws.onopen = () => {
      console.log('Notification WebSocket connected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }
}
```

### 7. **Business Logic Services**
```typescript
// src/services/dashboardService.ts
import { EventService } from './eventService';
import { UserService } from './userService';

export class DashboardService {
  static async getDashboardStats(): Promise<{
    totalEvents: number;
    pendingEvents: number;
    totalUsers: number;
    recentActivity: any[];
  }> {
    try {
      // Combine multiple API calls
      const [events, users] = await Promise.all([
        EventService.getEvents(),
        UserService.getUsers(),
      ]);

      const pendingEvents = events.filter(event => event.status === 'pending');
      const recentActivity = events
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      return {
        totalEvents: events.length,
        pendingEvents: pendingEvents.length,
        totalUsers: users.length,
        recentActivity,
      };
    } catch (error: any) {
      throw new Error('Failed to fetch dashboard stats');
    }
  }

  static async getEventAnalytics(): Promise<any> {
    try {
      const events = await EventService.getEvents();
      
      // Process analytics data
      const statusCounts = events.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const monthlyData = this.groupEventsByMonth(events);

      return {
        statusCounts,
        monthlyData,
        totalRevenue: events.reduce((sum, event) => sum + (event.budget || 0), 0),
      };
    } catch (error: any) {
      throw new Error('Failed to fetch analytics');
    }
  }

  private static groupEventsByMonth(events: any[]): any[] {
    // Group events by month logic
    return [];
  }
}
```

## Cách sử dụng Services trong Components/Hooks:

```typescript
// src/hooks/useAuth.ts
import { AuthService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user } = await AuthService.login({ email, password });
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return { user, isLoading, login, logout };
};

// src/pages/admin/UserManagement.tsx
import { UserService } from '../../services/userService';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await UserService.getUsers();
        setUsers(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Component JSX...
};
```

## Lợi ích của Services Layer:

1. **Separation of Concerns**: Tách logic API khỏi UI components
2. **Reusability**: Tái sử dụng API logic giữa nhiều components
3. **Centralized Logic**: Tập trung xử lý business logic
4. **Error Handling**: Xử lý lỗi thống nhất
5. **Data Transformation**: Transform data giữa frontend và backend
6. **Testing**: Dễ dàng unit test business logic
7. **Maintainability**: Dễ bảo trì và cập nhật API logic

Thư mục `services` tạo ra một **abstraction layer** giữa UI components và backend APIs, giúp code dễ bảo trì và mở rộng.