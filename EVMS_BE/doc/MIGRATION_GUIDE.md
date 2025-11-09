# Migration Guide: Remove VehicleType, Use VehicleCategory

## Tổng quan
Migration này sẽ bỏ field `vehicleType` và chỉ sử dụng `vehicleCategory` để đồng nhất hóa dữ liệu xe.

## Mapping
```
electric_car → CAR
electric_motorcycle → MOTOBIKE  
electric_bike → BICYCLE
```

## Các thay đổi đã thực hiện

### 1. Model Changes
- **File:** `src/models/Vehicle.ts`
  - Xóa `vehicleType: string` khỏi interface `IVehicle`
  - Xóa schema field `vehicleType`
  - Chỉ giữ lại `vehicleCategory: VehicleCategory`

### 2. Controller Changes  
- **File:** `src/controllers/vehicleController.ts`
  - Xóa `vehicleType` khỏi destructuring trong `createVehicle()`
  - Xóa validation cho `vehicleType`
  - Xóa `vehicleType` khỏi query parameters trong `getAllVehicles()`
  - Xóa `vehicleType` khỏi update logic trong `updateVehicle()`
  - Xóa `vehicleType` khỏi response objects

### 3. Database Migration
- **File:** `migrate-vehicle-type.js`
  - Script migration để chuyển đổi dữ liệu hiện có
  - Xóa field `vehicleType` khỏi tất cả documents
  - Cập nhật `vehicleCategory` dựa trên mapping

## Cách chạy Migration

### 1. Backup Database (Quan trọng!)
```bash
mongodump --db evms --out backup-before-migration
```

### 2. Chạy Migration
```bash
cd EVMS_BE
node migrate-vehicle-type.js
```

### 3. Kiểm tra kết quả
- Kiểm tra console output để đảm bảo migration thành công
- Verify rằng không còn documents nào có field `vehicleType`
- Verify rằng tất cả documents đều có field `vehicleCategory` với giá trị hợp lệ

## API Changes

### Request Changes
- **POST /api/vehicles**: Bỏ `vehicleType` khỏi request body
- **PUT /api/vehicles/:id**: Bỏ `vehicleType` khỏi request body  
- **GET /api/vehicles**: Bỏ `vehicleType` khỏi query parameters

### Response Changes
- Tất cả vehicle responses chỉ trả về `vehicleCategory`
- Không còn field `vehicleType` trong response

## Frontend Updates Required

1. **API Calls**: Cập nhật tất cả API calls để bỏ `vehicleType`
2. **Forms**: Cập nhật vehicle creation/update forms
3. **Validation**: Cập nhật client-side validation
4. **UI Components**: Cập nhật dropdowns, filters, displays

## Rollback Plan

Nếu cần rollback:
1. Restore database từ backup
2. Revert code changes
3. Restart application

## Testing

Sau migration, test các scenarios:
1. Tạo vehicle mới với `vehicleCategory`
2. Cập nhật vehicle với `vehicleCategory`  
3. Lấy danh sách vehicles
4. Filter vehicles theo `vehicleCategory`
5. Verify tất cả existing vehicles có `vehicleCategory` hợp lệ
