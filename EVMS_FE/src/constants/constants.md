GitHub Copilot: Thư mục `src/constants` có chức năng chứa **các giá trị không đổi (constants)** được sử dụng trong toàn bộ ứng dụng. Dựa vào cấu trúc project của bạn, đây là các chức năng chính:

## Chức năng của `src/constants`:

### 1. **Color Constants** (`color/color.css`)
- Định nghĩa bảng màu chuẩn cho toàn bộ ứng dụng
- Chứa các class CSS cho màu sắc: gray, azure, blue, yellow, orange
- Đảm bảo tính nhất quán về màu sắc trong UI

### 2. **Theme Constants** (`theme/theme.css`)  
- Định nghĩa các theme và style patterns
- Chứa các component style được định nghĩa trước (button themes, card themes, etc.)
- Quản lý dark/light mode hoặc các theme khác nhau

### 3. **Application Constants** (có thể mở rộng)
```typescript
// src/constants/app.ts
export const APP_CONFIG = {
  APP_NAME: 'EVMS',
  VERSION: '1.0.0',
  API_VERSION: 'v1',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FORMATS: ['jpg', 'png', 'pdf'],
} as const;

// src/constants/routes.ts  
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
  STAFF: '/staff/dashboard',
  TECHNICIAN: '/technician/dashboard',
  CUSTOMER: '/customer/dashboard',
} as const;

// src/constants/roles.ts
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff', 
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer',
} as const;

// src/constants/status.ts
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
```

### 4. **API Endpoints** 
```typescript
// src/constants/endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
  }
} as const;
```

### 5. **Validation Rules**
```typescript
// src/constants/validation.ts
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: true,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    PATTERN: /^[0-9]{10,11}$/,
  }
} as const;
```

## Lợi ích của việc sử dụng `constants`:

1. **Tính nhất quán**: Đảm bảo các giá trị được sử dụng thống nhất
2. **Dễ bảo trì**: Chỉ cần thay đổi ở một nơi khi cần update
3. **Tránh lỗi typo**: IntelliSense sẽ gợi ý và kiểm tra
4. **Type Safety**: TypeScript có thể kiểm tra type cho constants
5. **Tái sử dụng**: Có thể import và sử dụng ở nhiều nơi

## Cách sử dụng trong Router của bạn:

```typescript
import { ROUTES, USER_ROLES } from './constants';

// Thay vì hardcode strings
<Route path={ROUTES.LOGIN} element={<Login />} />
<Route path={ROUTES.ADMIN} element={<AdminRoute>...</AdminRoute>} />

// Sử dụng trong logic
if (user.role === USER_ROLES.ADMIN) {
  navigate(ROUTES.ADMIN);
}
```

Thư mục `constants` giúp tổ chức code tốt hơn và tạo ra một "single source of truth" cho các giá trị quan trọng trong ứng dụng.