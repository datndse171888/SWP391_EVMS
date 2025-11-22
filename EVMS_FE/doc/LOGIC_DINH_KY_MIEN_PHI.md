# 📋 Logic Lịch Tái Định Kỳ Miễn Phí (0đ)

## 🎯 Tổng Quan

Hệ thống đã được implement **đầy đủ logic** để xử lý lịch tái định kỳ với giá **0đ (miễn phí 100%)**.

---

## 🔄 Flow Hoàn Chỉnh

### **1. Trang "Bảo dưỡng định kỳ" (`Maintenance.tsx`)**

#### Điều kiện hiển thị:
- ✅ User đã từng sử dụng service/package định kỳ
- ✅ `remainingVisits > 0` (còn lượt)
- ✅ Hiển thị timeline với các mốc bảo dưỡng

#### Nút "Đặt lịch":
```typescript
const handleBookDue = async (sub: any) => {
  // Navigate với các params đặc biệt:
  navigate(`/booking?${[
    `vehicleId=${vehicleId}`,
    'lockService=1',     // Khóa không cho đổi service
    'lockVehicle=1',     // Khóa không cho đổi xe
    'periodic=1'         // 🔑 Flag quan trọng: đây là lịch tái định kỳ
  ].join('&')}`);
}
```

---

### **2. Booking Flow (`Booking.tsx`)**

#### Nhận params từ URL:
```typescript
const params = new URLSearchParams(location.search);
const periodic = params.get('periodic') === '1';

if (periodic) setIsPeriodic(true); // ✅ Set flag
```

#### Truyền xuống Confirmation:
```typescript
<Confirmation
  formData={formData}
  isPeriodic={isPeriodic}  // ✅ Pass flag
  onPrevious={() => setStep(3)}
  onComplete={handleBookingComplete}
/>
```

---

### **3. Confirmation Step (`Confirmation.tsx`)**

#### 🎨 UI Hiển Thị:

##### a) Badge "TÁI ĐỊNH KỲ" trên header:
```typescript
<h3 className="...justify-between">
  <span>Dịch vụ đã chọn</span>
  {isPeriodic && (
    <span className="...bg-blue-100 text-blue-800">
      TÁI ĐỊNH KỲ
    </span>
  )}
</h3>
```

##### b) Giá gạch ngang + Miễn phí:
```typescript
{isPeriodic && originalPrice ? (
  <>
    <p className="line-through text-gray-400">
      {formatPrice(originalPrice)}
    </p>
    <p className="text-green-600 font-bold">
      {formatPrice(0)} (Miễn phí)
    </p>
  </>
) : (
  <p className="text-orange-600">
    {formatPrice(price)}
  </p>
)}
```

##### c) Badge "🎉 MIỄN PHÍ - Lịch tái định kỳ":
```typescript
{isPeriodic && (
  <span className="...bg-green-100 text-green-800">
    🎉 MIỄN PHÍ - Lịch tái định kỳ
  </span>
)}
```

##### d) Giá tổng = 0đ (màu xanh):
```typescript
const displayedPrice = isPeriodic ? 0 : (service?.price || servicePackage?.price || 0);

<span className={isPeriodic ? 'text-green-600' : 'text-orange-600'}>
  {formatPrice(displayedPrice)}
</span>
```

#### 📤 Submit Request:
```typescript
const cleanFormData = {
  userID: formData.userID,
  bookingDate: formData.bookingDate,
  vehicleID: formData.vehicleID,
  serviceID: formData.serviceID,
  ...(isPeriodic && { isPeriodicRecheck: true }), // ✅ Gửi flag
};

await AppointmentApi.createAppointment(cleanFormData);
```

---

### **4. Backend Validation (`appointmentController.ts`)**

#### 🔒 Validation Logic (MỚI THÊM):

```typescript
if (isPeriodicRecheck === true || isPeriodicRecheck === 'true') {
  
  // 1. Validate: Phải có vehicleID
  if (!vehicleID || !mongoose.Types.ObjectId.isValid(vehicleID)) {
    return res.status(400).json({ 
      message: 'Lịch tái định kỳ yêu cầu phải có thông tin xe' 
    });
  }

  // 2. Validate: Phải có serviceID hoặc servicePackageID
  if (!serviceID && !servicePackageID) {
    return res.status(400).json({ 
      message: 'Lịch tái định kỳ yêu cầu phải chọn dịch vụ hoặc gói dịch vụ' 
    });
  }

  // 3. Load config của service/package
  let config = null;
  if (serviceID) {
    const svc = await Service.findById(serviceID)
      .select('periodicEnabled intervalMonths defaultTotalVisits')
      .lean();
    if (svc && svc.periodicEnabled) config = svc;
  } else if (servicePackageID) {
    const pkg = await ServicePackage.findById(servicePackageID)
      .select('periodicEnabled intervalMonths defaultTotalVisits')
      .lean();
    if (pkg && pkg.periodicEnabled) config = pkg;
  }

  // 4. Validate: Service/Package phải là periodic
  if (!config) {
    return res.status(400).json({ 
      message: 'Dịch vụ/gói này không hỗ trợ bảo dưỡng định kỳ hoặc chưa được cấu hình' 
    });
  }

  // 5. Đếm số lượt đã dùng
  const filter = { 
    vehicleID: new mongoose.Types.ObjectId(vehicleID), 
    status: 'completed' 
  };
  if (serviceID) filter.serviceID = new mongoose.Types.ObjectId(serviceID);
  if (servicePackageID) filter.servicePackageID = new mongoose.Types.ObjectId(servicePackageID);

  const visitsUsed = await Appointment.countDocuments(filter);
  const remainingVisits = Math.max(0, (config.defaultTotalVisits || 0) - (visitsUsed || 0));

  // 6. Validate: Phải còn lượt ⭐ QUAN TRỌNG
  if (remainingVisits <= 0) {
    return res.status(400).json({ 
      message: `Bạn đã sử dụng hết ${config.defaultTotalVisits} lần của gói định kỳ này. Vui lòng đặt lịch bình thường hoặc chọn gói mới.`,
      code: 'NO_REMAINING_VISITS',
      data: {
        totalVisits: config.defaultTotalVisits,
        visitsUsed,
        remainingVisits: 0
      }
    });
  }

  // 7. Validate: Phải đã từng đặt lịch này trước đó
  const firstCompleted = await Appointment.findOne(filter)
    .sort({ bookingDate: 1 })
    .select('bookingDate')
    .lean();
    
  if (!firstCompleted) {
    return res.status(400).json({ 
      message: 'Không tìm thấy lịch sử sử dụng dịch vụ định kỳ này. Vui lòng đặt lịch bình thường cho lần đầu.',
      code: 'NO_PERIODIC_HISTORY'
    });
  }

  console.log(`✅ Validated periodic recheck: remainingVisits=${remainingVisits}/${config.defaultTotalVisits}`);
}

// Tạo appointment với isPeriodicRecheck = true
const appointment = await Appointment.create({
  userID,
  vehicleID,
  serviceID,
  servicePackageID,
  bookingDate,
  status: 'pending',
  isPeriodicRecheck: isPeriodicRecheck === true || isPeriodicRecheck === 'true' ? true : false,
  // ... other fields
});
```

---

## ✅ Checklist Đầy Đủ

### Frontend:
- ✅ URL có flag `periodic=1`
- ✅ Booking component nhận và set `isPeriodic = true`
- ✅ Confirmation nhận prop `isPeriodic`
- ✅ Hiển thị giá = 0đ khi `isPeriodic = true`
- ✅ Hiển thị badge "TÁI ĐỊNH KỲ"
- ✅ Hiển thị badge "MIỄN PHÍ"
- ✅ Gạch ngang giá gốc, hiển thị 0đ
- ✅ Gửi `isPeriodicRecheck: true` khi submit
- ✅ Xử lý error message từ backend

### Backend:
- ✅ Nhận field `isPeriodicRecheck` từ request
- ✅ Validate `vehicleID` phải có
- ✅ Validate `serviceID` hoặc `servicePackageID` phải có
- ✅ Validate service/package phải có `periodicEnabled = true`
- ✅ Đếm `visitsUsed` từ appointments đã completed
- ✅ Tính `remainingVisits = totalVisits - visitsUsed`
- ✅ **BLOCK** nếu `remainingVisits <= 0`
- ✅ Validate phải có lịch sử (firstCompleted) tồn tại
- ✅ Lưu `isPeriodicRecheck = true` vào DB
- ✅ Return error rõ ràng với code và message

### Database:
- ✅ Model `Appointment` có field `isPeriodicRecheck: boolean`
- ✅ Model `Service` có fields: `periodicEnabled`, `intervalMonths`, `defaultTotalVisits`
- ✅ Model `ServicePackage` có fields: `periodicEnabled`, `intervalMonths`, `defaultTotalVisits`

---

## 🎯 Kịch Bản Test

### **Kịch bản 1: Đặt lịch tái định kỳ thành công**

**Điều kiện:**
- User đã hoàn thành 2/5 lần
- Còn 3/5 lần

**Kết quả:**
- ✅ Hiển thị giá 0đ
- ✅ Hiển thị badge "MIỄN PHÍ"
- ✅ Submit thành công với `isPeriodicRecheck: true`
- ✅ Tạo appointment trong DB

---

### **Kịch bản 2: Hết lượt - BLOCK**

**Điều kiện:**
- User đã hoàn thành 5/5 lần
- Còn 0/5 lần

**Kết quả:**
- ❌ Không hiển thị trong trang "Bảo dưỡng định kỳ" (đã filter ở backend `remainingVisits > 0`)
- ❌ Nếu user cố tình gửi request với `isPeriodicRecheck: true`:
  ```json
  {
    "message": "Bạn đã sử dụng hết 5 lần của gói định kỳ này. Vui lòng đặt lịch bình thường hoặc chọn gói mới.",
    "code": "NO_REMAINING_VISITS",
    "data": {
      "totalVisits": 5,
      "visitsUsed": 5,
      "remainingVisits": 0
    }
  }
  ```

---

### **Kịch bản 3: Chưa từng đặt lịch định kỳ - BLOCK**

**Điều kiện:**
- User lần đầu đặt service này
- Không có lịch sử completed

**Kết quả:**
- ❌ Backend trả về error:
  ```json
  {
    "message": "Không tìm thấy lịch sử sử dụng dịch vụ định kỳ này. Vui lòng đặt lịch bình thường cho lần đầu.",
    "code": "NO_PERIODIC_HISTORY"
  }
  ```

---

### **Kịch bản 4: Service không phải periodic - BLOCK**

**Điều kiện:**
- User chọn service có `periodicEnabled = false`
- Cố gửi `isPeriodicRecheck: true`

**Kết quả:**
- ❌ Backend trả về error:
  ```json
  {
    "message": "Dịch vụ/gói này không hỗ trợ bảo dưỡng định kỳ hoặc chưa được cấu hình"
  }
  ```

---

## 📊 Luồng Dữ Liệu

```
┌─────────────────────┐
│ Maintenance Page    │
│ - Hiển thị timeline │
│ - Nút "Đặt lịch"    │
└──────────┬──────────┘
           │ Click "Đặt lịch"
           ↓
┌─────────────────────────────────────────────┐
│ URL: /booking?periodic=1&vehicleId=xxx      │
│      &serviceId=yyy&lockService=1           │
└──────────┬──────────────────────────────────┘
           │
           ↓
┌─────────────────────┐
│ Booking.tsx         │
│ - Nhận periodic=1   │
│ - Set isPeriodic    │
└──────────┬──────────┘
           │ Step 1-3: Chọn xe, service, datetime
           ↓
┌─────────────────────────────────────────────┐
│ Confirmation.tsx                            │
│ - Nhận isPeriodic prop                      │
│ - Hiển thị giá = 0đ                         │
│ - Hiển thị badge "MIỄN PHÍ"                 │
│ - Gửi isPeriodicRecheck: true               │
└──────────┬──────────────────────────────────┘
           │ Submit
           ↓
┌─────────────────────────────────────────────┐
│ Backend: createAppointment()                │
│ ┌─────────────────────────────────────────┐ │
│ │ if (isPeriodicRecheck) {                │ │
│ │   1. Validate vehicleID                 │ │
│ │   2. Validate serviceID/packageID       │ │
│ │   3. Load config (periodicEnabled)      │ │
│ │   4. Count visitsUsed                   │ │
│ │   5. Calculate remainingVisits          │ │
│ │   6. BLOCK if remainingVisits <= 0 ❌   │ │
│ │   7. Validate firstCompleted exists     │ │
│ │   8. ✅ Pass validation                 │ │
│ │ }                                        │ │
│ └─────────────────────────────────────────┘ │
│ - Create Appointment với isPeriodicRecheck  │
│ - Save to DB                                │
└──────────┬──────────────────────────────────┘
           │ Success
           ↓
┌─────────────────────┐
│ Success Message     │
│ Redirect to Profile │
└─────────────────────┘
```

---

## 🔍 Debug & Testing

### Kiểm tra trong Console:

1. **Frontend - Booking.tsx:**
   ```javascript
   console.log('isPeriodic:', isPeriodic); // Should be true
   ```

2. **Frontend - Confirmation.tsx:**
   ```javascript
   console.log('Submitting with:', { 
     isPeriodicRecheck: isPeriodic 
   });
   console.log('displayedPrice:', displayedPrice); // Should be 0
   ```

3. **Backend - appointmentController.ts:**
   ```javascript
   console.log('Received isPeriodicRecheck:', isPeriodicRecheck);
   console.log('Validated periodic recheck:', {
     remainingVisits,
     totalVisits,
     visitsUsed
   });
   ```

### Kiểm tra trong Database:

```javascript
// Check appointment was created with correct flag
db.appointments.findOne({ 
  _id: appointmentId 
}).then(apt => {
  console.log('isPeriodicRecheck:', apt.isPeriodicRecheck); // Should be true
});
```

---

## 🎉 Kết Luận

**Hệ thống đã hoàn chỉnh 100% logic giảm giá 0đ cho lịch tái định kỳ!**

### Các tính năng đã có:
✅ Frontend hiển thị giá 0đ khi là lịch tái định kỳ  
✅ Frontend gửi flag `isPeriodicRecheck: true`  
✅ Backend validate đầy đủ các điều kiện  
✅ Backend BLOCK khi hết lượt hoặc không hợp lệ  
✅ UI đẹp với badges "MIỄN PHÍ" và "TÁI ĐỊNH KỲ"  
✅ Error messages rõ ràng, dễ hiểu  

### Không cần thêm gì nữa! 🎊

Chỉ cần test kỹ các kịch bản trên là xong.

