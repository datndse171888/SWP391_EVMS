# Phân Quyền Technician

## Tổng quan

Hệ thống có 2 loại technician:
- **Leader**: Có quyền tạo và quản lý vehicle condition reports, tạo và quản lý tasks
- **Member**: Chỉ có quyền làm tasks (update status của tasks được assign) và xem vehicle condition reports

---

## 1. Vehicle Condition Report - Báo cáo Tình trạng Xe

### 1.1. Tạo Vehicle Condition Report
**Quyền: CHỈ LEADER**

#### API Routes:
- `POST /api/vehicle-condition-reports` - Tạo báo cáo tình trạng xe (before-service hoặc after-service)
  - Middleware: `authMiddleware`, `roleMiddleware(['technician'])`, `technicianSubroleMiddleware`, `technicianLeaderOnly`
  - Chỉ technician leader có thể tạo
  - Mỗi appointment có thể có tối đa 2 reports:
    - 1 report với stage = "before-service" (trước khi sửa)
    - 1 report với stage = "after-service" (sau khi sửa)

#### Request Body:
```json
{
  "appointmentID": "string (required)",
  "stage": "before-service | after-service (required)",
  "details": "string (required)",
  "image": "string (optional)",
  "technicianId": "string (optional - tự động lấy từ token)"
}
```

#### Response:
```json
{
  "_id": "reportId",
  "appointmentID": {...},
  "technicianId": {...},
  "stage": "before-service | after-service",
  "details": "string",
  "image": "string (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 1.2. Xem Vehicle Condition Reports
**Quyền: LEADER VÀ MEMBER**

- `GET /api/vehicle-condition-reports/appointment/:appointmentId` - Lấy danh sách reports của appointment
  - Middleware: `authMiddleware`, `roleMiddleware(['technician'])`, `technicianSubroleMiddleware`, `technicianAny`
  - Cả leader và member đều có thể xem (nếu được assign vào appointment)
  - Trả về danh sách tất cả reports (before-service và after-service) của appointment

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "reportId",
      "appointmentID": {...},
      "technicianId": {...},
      "stage": "before-service | after-service",
      "details": "string",
      "image": "string (optional)",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ]
}
```

---

## 2. Checklist/Tasks - Quản lý Công việc

### 2.1. Tạo Checklist/Task
**Quyền: CHỈ LEADER**

- `POST /api/checklists` - Tạo checklist với các tasks
  - Middleware: `authMiddleware`, `roleMiddleware(['technician'])`, `technicianSubroleMiddleware`, `technicianLeaderOnly`
  - Chỉ leader có thể tạo checklist và tasks
  - Yêu cầu: Phải có vehicle condition report "before-service" trước khi tạo checklist

### 2.2. Xem Checklist/Tasks
**Quyền: LEADER VÀ MEMBER**

- `GET /api/checklists/appointment/:appointmentId` - Lấy danh sách tasks của appointment
  - Middleware: `authMiddleware`, `roleMiddleware(['technician'])`, `technicianSubroleMiddleware`, `technicianAny`
  - Cả leader và member đều có thể xem

- `GET /api/checklists/:id` - Lấy chi tiết task
  - Middleware: `authMiddleware`, `roleMiddleware(['technician'])`, `technicianSubroleMiddleware`, `technicianAny`
  - Cả leader và member đều có thể xem

### 2.3. Cập nhật Task Status (Làm Task)
**Quyền: LEADER VÀ MEMBER**

- `PATCH /api/checklists/:id/status` - Cập nhật trạng thái task
  - Middleware: `authMiddleware`, `roleMiddleware(['technician'])`, `technicianSubroleMiddleware`, `technicianAny`
  - Cả leader và member đều có thể update status của task được assign
  - Status transitions:
    - `pending` → `completed` hoặc `skipped`
    - `completed` → không thể thay đổi
    - `skipped` → `pending` hoặc `completed`

### 2.4. Quản lý Checklist/Tasks (Chỉ Leader)
**Quyền: CHỈ LEADER**

- `PUT /api/checklists/:id` - Cập nhật task (chỉnh sửa task name, description, etc.)
  - Middleware: `authMiddleware`, `roleMiddleware(['technician'])`, `technicianSubroleMiddleware`, `technicianLeaderOnly`

- `DELETE /api/checklists/:id` - Xóa task
  - Middleware: `authMiddleware`, `roleMiddleware(['technician'])`, `technicianSubroleMiddleware`, `technicianLeaderOnly`

- `PATCH /api/checklists/:id/assign-technician` - Assign task cho technician
  - Middleware: `authMiddleware`, `roleMiddleware(['technician'])`, `technicianSubroleMiddleware`, `technicianLeaderOnly`

---

## 3. Appointment - Lịch hẹn

### Quyền: LEADER VÀ MEMBER (cả hai đều có thể xem)

- `GET /api/appointments/technician/me` - Lấy danh sách appointments được assign
  - Middleware: `authMiddleware`
  - Cả leader và member đều có thể xem appointments mà họ được assign
  - Filter: chỉ lấy appointments với status "confirmed"

- `GET /api/appointments/:id` - Lấy chi tiết appointment
  - Middleware: `authMiddleware`
  - Cả leader và member đều có thể xem appointments mà họ được assign

- `PATCH /api/appointments/:id/status` - Cập nhật trạng thái appointment
  - Middleware: `authMiddleware`
  - Cả leader và member đều có thể update status (nếu được assign vào appointment)

---

## Tóm tắt Phân Quyền

| Chức năng | Leader | Member |
|-----------|--------|--------|
| **Vehicle Condition Report** |
| Tạo Report (before/after) | ✅ | ❌ |
| Xem Reports | ✅ | ✅ |
| **Checklist/Tasks** |
| Tạo Checklist/Tasks | ✅ | ❌ |
| Xem Checklist/Tasks | ✅ | ✅ |
| Update Task Status (làm task) | ✅ | ✅ |
| Update Task Details | ✅ | ❌ |
| Delete Task | ✅ | ❌ |
| Assign Task | ✅ | ❌ |
| **Appointment** |
| Xem Appointments | ✅ | ✅ |
| Update Appointment Status | ✅ | ✅ |

---

## Middleware Functions

### `technicianSubroleMiddleware`
- Tự động detect và set `req.user.technicianRole` từ Technician model
- Chạy trước các middleware khác để đảm bảo có thông tin role

### `technicianLeaderOnly`
- Chỉ cho phép technician với role = "leader"
- Return 403 nếu không phải leader

### `technicianAny`
- Cho phép cả leader và member
- Return 403 nếu không phải technician hoặc không có technicianRole

---

## API Endpoints Summary

### Vehicle Condition Reports
- `POST /api/vehicle-condition-reports` - Tạo report (Leader only)
- `GET /api/vehicle-condition-reports/appointment/:appointmentId` - Lấy reports (Leader + Member)

### Checklist/Tasks
- `POST /api/checklists` - Tạo checklist (Leader only)
- `GET /api/checklists/appointment/:appointmentId` - Lấy tasks (Leader + Member)
- `GET /api/checklists/:id` - Lấy chi tiết task (Leader + Member)
- `PATCH /api/checklists/:id/status` - Update task status (Leader + Member)
- `PUT /api/checklists/:id` - Update task details (Leader only)
- `DELETE /api/checklists/:id` - Delete task (Leader only)
- `PATCH /api/checklists/:id/assign-technician` - Assign task (Leader only)

### Appointments
- `GET /api/appointments/technician/me` - Lấy appointments (Leader + Member)
- `GET /api/appointments/:id` - Lấy chi tiết appointment (Leader + Member)
- `PATCH /api/appointments/:id/status` - Update status (Leader + Member)

