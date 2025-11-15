# 🔐 HỆ THỐNG PHÂN QUYỀN EVMS - HƯỚNG DẪN SỬ DỤNG

## 📋 TỔNG QUAN

Hệ thống EVMS đã được implement với 4 loại người dùng và hệ thống phân quyền hoàn chỉnh:

- **ADMIN**: Quyền cao nhất, quản lý toàn bộ hệ thống
- **STAFF**: Quản lý khách hàng, dịch vụ, lịch hẹn
- **TECHNICIAN**: Thực hiện dịch vụ, quản lý công việc
- **CUSTOMER**: Đặt lịch hẹn, xem dịch vụ

## 🏗️ KIẾN TRÚC BACKEND

### 1. Middleware System
```
EVMS_BE/src/middleware/
├── authMiddleware.ts      # Xác thực JWT token
├── roleMiddleware.ts      # Kiểm tra quyền hạn
└── index.ts              # Export middleware
```

### 2. User Model
```typescript
// EVMS_BE/src/models/User.ts
role: 'admin' | 'staff' | 'technician' | 'customer'
```

### 3. TypeScript Interfaces
```typescript
// EVMS_BE/src/types/express/index.d.ts
interface IUser {
  id: string;
  role: 'admin' | 'staff' | 'technician' | 'customer';
  // ... other fields
}
```

## 🎨 KIẾN TRÚC FRONTEND

### 1. AuthContext
```typescript
// EVMS_FE/src/contexts/AuthContext.tsx
const { user, login, logout, hasRole, hasPermission } = useAuth();
```

### 2. Protected Routes
```typescript
// EVMS_FE/src/components/auth/ProtectedRoute.tsx
<AdminRoute><AdminLayout>...</AdminLayout></AdminRoute>
<StaffRoute><StaffLayout>...</StaffLayout></StaffRoute>
<TechnicianRoute><TechnicianLayout>...</TechnicianLayout></TechnicianRoute>
<CustomerRoute><CustomerLayout>...</CustomerLayout></CustomerRoute>
```

### 3. Role-based Layouts
```
EVMS_FE/src/components/layout/
├── AdminLayout.tsx        # Layout cho admin
├── StaffLayout.tsx        # Layout cho staff
├── TechnicianLayout.tsx   # Layout cho technician
├── CustomerLayout.tsx     # Layout cho customer
└── index.ts              # Export layouts
```

## 🚀 CÁCH SỬ DỤNG

### 1. Environment Variables

**Backend (.env):**
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/evms
```

**Frontend (.env):**
```env
VITE_BASE_API_URL=http://localhost:4000/api
```

### 2. Backend Route Protection

```typescript
// Bảo vệ route với middleware
import { authMiddleware, adminOnly, staffOnly } from '../middleware';

// Chỉ admin mới được truy cập
router.get('/admin/users', authMiddleware, adminOnly, getUsers);

// Admin và staff được truy cập
router.get('/staff/customers', authMiddleware, staffOnly, getCustomers);

// Tất cả user đã đăng nhập
router.get('/profile', authMiddleware, authenticatedOnly, getProfile);
```

### 3. Frontend Route Protection

```typescript
// Router.tsx
<Route path="/admin/*" element={
  <AdminRoute>
    <AdminLayout>
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Routes>
    </AdminLayout>
  </AdminRoute>
} />
```

### 4. Conditional UI

```typescript
// Header.tsx - Hiển thị menu khác nhau theo role
const { user, hasRole } = useAuth();

{hasRole(['admin', 'staff']) && (
  <Link to="/admin/users">Quản lý người dùng</Link>
)}

{hasRole('customer') && (
  <Link to="/customer/appointments">Lịch hẹn của tôi</Link>
)}
```

### 5. Permission Checking

```typescript
// Kiểm tra quyền cụ thể
const { hasPermission } = useAuth();

{hasPermission('users', 'create') && (
  <button onClick={createUser}>Tạo người dùng</button>
)}

{hasPermission('appointments', 'read') && (
  <AppointmentList />
)}
```

## 📊 QUYỀN HẠN CHI TIẾT

### ADMIN
- ✅ Quản lý tất cả người dùng (CRUD)
- ✅ Quản lý dịch vụ (CRUD)
- ✅ Quản lý lịch hẹn (CRUD)
- ✅ Xem tất cả báo cáo
- ✅ Cài đặt hệ thống

### STAFF
- ✅ Xem và cập nhật thông tin khách hàng
- ✅ Quản lý dịch vụ (CRUD)
- ✅ Quản lý lịch hẹn (CRUD)
- ✅ Xem báo cáo
- ❌ Không thể xóa người dùng

### TECHNICIAN
- ✅ Xem và cập nhật dịch vụ
- ✅ Xem và cập nhật lịch hẹn
- ✅ Quản lý hồ sơ cá nhân
- ❌ Không thể tạo dịch vụ mới
- ❌ Không thể xem báo cáo

### CUSTOMER
- ✅ Xem dịch vụ
- ✅ Đặt lịch hẹn
- ✅ Xem lịch hẹn của mình
- ✅ Quản lý hồ sơ cá nhân
- ❌ Không thể xem thông tin người khác

## 🔄 FLOW HOẠT ĐỘNG

### 1. Login Flow
```
User đăng nhập → Backend tạo JWT token → 
Frontend lưu token → Token được gửi kèm mọi request
```

### 2. Route Protection Flow
```
Request → AuthMiddleware kiểm tra token → 
RoleMiddleware kiểm tra quyền → Cho phép/từ chối truy cập
```

### 3. Frontend Navigation Flow
```
User navigate → ProtectedRoute kiểm tra auth → 
Kiểm tra role → Hiển thị component phù hợp
```

## 🛠️ CÁC FILE CHÍNH

### Backend
- `EVMS_BE/src/middleware/authMiddleware.ts` - Xác thực JWT
- `EVMS_BE/src/middleware/roleMiddleware.ts` - Kiểm tra quyền
- `EVMS_BE/src/models/User.ts` - User model với 4 roles
- `EVMS_BE/src/types/express/index.d.ts` - TypeScript interfaces
- `EVMS_BE/src/routes/auth.ts` - Auth routes với middleware

### Frontend
- `EVMS_FE/src/contexts/AuthContext.tsx` - Auth state management
- `EVMS_FE/src/components/auth/ProtectedRoute.tsx` - Route protection
- `EVMS_FE/src/components/layout/` - Role-based layouts
- `EVMS_FE/src/Router.tsx` - Route configuration
- `EVMS_FE/src/components/common/header/Header.tsx` - Conditional UI

## ⚠️ LƯU Ý QUAN TRỌNG

1. **JWT Secret**: Phải đặt trong environment variables
2. **Token Expiration**: Nên set thời gian hết hạn hợp lý (7d)
3. **Role Validation**: Luôn validate ở cả frontend và backend
4. **Error Handling**: Xử lý lỗi 401/403 một cách graceful
5. **Security**: Không trust frontend, luôn validate ở backend

## 🧪 TESTING

### Test Login với các role khác nhau:
```bash
# Admin
POST /api/auth/login
{
  "email": "admin@evms.com",
  "password": "password"
}

# Staff
POST /api/auth/login
{
  "email": "staff@evms.com", 
  "password": "password"
}

# Technician
POST /api/auth/login
{
  "email": "technician@evms.com",
  "password": "password"
}

# Customer
POST /api/auth/login
{
  "email": "customer@evms.com",
  "password": "password"
}
```

### Test Protected Routes:
```bash
# Cần token trong header
GET /api/auth/profile
Authorization: Bearer <token>
```

Hệ thống phân quyền đã được implement hoàn chỉnh và sẵn sàng sử dụng! 🎉
