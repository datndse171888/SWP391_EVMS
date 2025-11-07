## Luồng phân quyền Technician Leader vs Technician Member (BE → FE)

### 1) Tổng quan vai trò
- **User.role (hệ vai chính)**: `admin`, `staff`, `technician`, `customer` (trên BE: `EVMS_BE/src/models/User.ts`).
- **Technician.subrole (vai phụ trong technician)**: `leader` | `member` (trên BE: `EVMS_BE/src/models/Technician.ts`, field `role`).

Luồng xác thực/ủy quyền sẽ dùng `role=technician` để cho phép vào khu vực kỹ thuật; sau đó dùng `technicianRole=leader|member` để phân biệt quyền hành động chi tiết.

---

### 2) Backend

#### 2.1 Xác thực JWT
- File: `EVMS_BE/src/middleware/authMiddleware.ts`
- Đầu vào: Header `Authorization: Bearer <accessToken>`
- Hành vi:
  - Xác thực token → tra user trong DB → gắn vào `req.user` các trường: `id`, `role`, `email`, `userName`, v.v.
  - Nếu `user.isDisabled` → 403.

Ví dụ `req.user` sau xác thực (rút gọn):

```json
{
  "id": "<userId>",
  "role": "technician",
  "email": "tech@example.com",
  "userName": "tech01",
  "isDisabled": false
}
```

#### 2.2 Kiểm tra vai chính (role)
- File: `EVMS_BE/src/middleware/roleMiddleware.ts`
- Dùng theo route: `roleMiddleware(['technician'])` để chỉ cho phép user có `role = technician`.
- Có sẵn helper: `technicianOnly`, `staffOnly`, `adminOnly`, v.v.

#### 2.3 Gắn và kiểm tra vai phụ technician (leader/member)
- File: `EVMS_BE/src/middleware/technicianRole.ts`
  - `technicianSubroleMiddleware`: nếu `req.user.role === 'technician'` thì tra `Technician` theo `userID` để gắn `req.user.technicianRole = 'leader' | 'member'`.
  - `technicianLeaderOnly`: chặn nếu `req.user.technicianRole !== 'leader'`.
  - `technicianAny`: yêu cầu `req.user.technicianRole` là `leader` hoặc `member`.

Các route hiện đang áp dụng:
- File: `EVMS_BE/src/routes/checklist.ts`
  - Xem checklist: chỉ cần technician (leader hoặc member)
    - `GET /checklists/appointment/:appointmentId` → `authMiddleware` → `roleMiddleware(['technician'])` → `technicianSubroleMiddleware` → `technicianAny`
    - `GET /checklists/:id` → tương tự trên
  - Quản lý checklist (tạo/sửa/xóa): chỉ leader
    - `POST /checklists` → `...` → `technicianLeaderOnly`
    - `PUT /checklists/:id` → `...` → `technicianLeaderOnly`
    - `DELETE /checklists/:id` → `...` → `technicianLeaderOnly`
  - Cập nhật trạng thái checklist: technician bất kỳ
    - `PATCH /checklists/:id/status` → `...` → `technicianAny`

- File: `EVMS_BE/src/routes/vehicleConditionReport.ts`
  - Tạo báo cáo tình trạng xe: chỉ leader
    - `POST /vehicle-condition-reports` → `...` → `technicianLeaderOnly`

#### 2.4 Model liên quan
- User: `EVMS_BE/src/models/User.ts` (`role: 'admin' | 'staff' | 'technician' | 'customer'`).
- Technician: `EVMS_BE/src/models/Technician.ts` (`role: 'leader' | 'member'`, gắn với `userID`).

#### 2.5 API lấy vai phụ trên FE
- Route: `GET /technician/:userId/info` (File: `EVMS_BE/src/routes/technician.ts` → `technicianController.getTechnicianInfo`).
- Trả về: `data.technician.role = 'leader' | 'member'` cùng các thông tin khác.

Response ví dụ:

```json
{
  "success": true,
  "data": {
    "technician": {
      "id": "<techId>",
      "introduction": "...",
      "role": "leader",
      "experience": 5,
      "startDate": "2022-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 3) Frontend

#### 3.1 Lưu và kiểm tra vai chính
- Context: `EVMS_FE/src/contexts/AuthContext.tsx`
  - Lưu `user` và `accessToken` trong LocalStorage.
  - `user.role` được dùng cho kiểm soát điều hướng/quyền cơ bản.
- Route guard: `EVMS_FE/src/components/auth/ProtectedRoute.tsx`
  - Thuộc tính `requiredRoles` để chặn/cho phép theo vai chính.
  - Ví dụ: `TechnicianRoute` tương đương `requiredRoles={['admin','staff','technician']}`.

Hiện tại FE không phân nhánh UI theo `leader/member` mặc định, nhưng có thể bổ sung như sau.

#### 3.2 Lấy và sử dụng vai phụ technician trên FE
Gợi ý triển khai UI phân quyền chi tiết theo leader/member:
1) Sau khi login, nếu `user.role === 'technician'`, gọi API `GET /technician/:userId/info` để lấy `technician.role`.
2) Lưu `technicianRole` vào state (vd: trong Context riêng hoặc mở rộng `AuthContext` với `technicianRole`).
3) Gating UI:
   - Hành động chỉ leader: ẩn/disable nút nếu `technicianRole !== 'leader'`.
   - Hành động cho mọi technician: hiển thị với `leader` và `member`.
4) Khi gọi BE, vẫn gửi token để BE kiểm tra chéo bằng middleware.

Pseudo-code ví dụ (React):

```tsx
// Sau khi user đăng nhập và là technician
const token = localStorage.getItem('accessToken');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (user?.role === 'technician') {
  const res = await fetch(`/api/technician/${user.id}/info`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  setTechnicianRole(data?.data?.technician?.role); // 'leader' | 'member'
}

// Gating UI
const canManageChecklist = technicianRole === 'leader';
const canUpdateStatus = technicianRole === 'leader' || technicianRole === 'member';
```

#### 3.3 Điều hướng và màn hình Unauthorized
- Nếu người dùng không có vai chính phù hợp (không phải technician) → `ProtectedRoute` điều hướng sang `/unauthorized`.
- Với leader/member, đề xuất hiển thị thông báo rõ ràng nếu BE trả về 403 khi thao tác (ví dụ: "Chỉ leader được phép thực hiện").

---

### 4) Ma trận quyền tóm tắt

- **Technician Leader**:
  - Xem checklist của cuộc hẹn, xem checklist chi tiết
  - Tạo/Sửa/Xóa checklist
  - Cập nhật trạng thái checklist
  - Tạo báo cáo tình trạng xe

- **Technician Member**:
  - Xem checklist của cuộc hẹn, xem checklist chi tiết
  - Cập nhật trạng thái checklist
  - Không được Tạo/Sửa/Xóa checklist
  - Không được Tạo báo cáo tình trạng xe

Lưu ý: BE là nguồn chân lý cuối cùng. FE có thể ẩn/disable UI nhưng mọi thao tác vẫn cần token và sẽ bị chặn bởi middleware nếu không đủ quyền.

---

### 5) Lỗi thường gặp và mã phản hồi
- 401 `MISSING_TOKEN` / `INVALID_TOKEN` / `TOKEN_EXPIRED`: Thiếu/Token không hợp lệ/hết hạn.
- 403 `ACCOUNT_DISABLED`: Tài khoản bị khóa.
- 403 `INSUFFICIENT_PERMISSIONS` hoặc thông báo tiếng Việt trong `technicianRole.ts`: Không đủ quyền (không phải technician, không phải leader, thiếu phân vai phụ, ...).

---

### 6) Checklist tích hợp nhanh
- BE:
  - Áp `authMiddleware` → `roleMiddleware(['technician'])` → `technicianSubroleMiddleware` → `technicianLeaderOnly/technicianAny` theo nhu cầu.
- FE:
  - Dùng `ProtectedRoute` với `requiredRoles` để chặn theo vai chính.
  - Gọi `GET /technician/:userId/info` để lấy `leader|member`, lưu state và ẩn/hiện/khóa nút theo vai phụ.
  - Luôn xử lý lỗi 403 từ BE để hiện thông báo phù hợp.


