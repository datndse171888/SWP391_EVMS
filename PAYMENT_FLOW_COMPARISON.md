# So sánh Cash Payment vs PayOS Payment Flow

## 🔵 CASH PAYMENT FLOW (Hoạt động đúng)

### Flow:
1. **User chọn appointment** → `selectedAppointment` được set (có `servicePrice`)
2. **User chọn parts** → `cartLines` được set
3. **User nhấn "Thanh toán"** → `handlePay()` được gọi
4. **Tạo bill** → `BillApi.createBill()` → `billId` và `billNumber` được set
5. **Confirm payment** → `PaymentApi.confirmCashPayment()` 
6. **Update bill status** → `BillApi.updateBillStatus(billId, 'paid')`
7. **Set state và chuyển step**:
   ```typescript
   setPaymentSuccess(true)
   setIsPaying(false)
   setActiveStep(4)
   ```

### Tại sao Cash Payment show được thông tin?

**Tất cả state đã có sẵn trong component:**
- ✅ `selectedAppointment` - đã có từ step 1 (có `servicePrice`)
- ✅ `cartLines` - đã có từ step 2
- ✅ `billId` - vừa tạo xong
- ✅ `billNumber` - vừa tạo xong
- ✅ `serviceFee` = `selectedAppointment.servicePrice || 0`
- ✅ `partsTotal` = `cartLines.reduce(...)`
- ✅ `grandTotal` = `serviceFee + partsTotal`

**Step 4 hiển thị trực tiếp từ state:**
```typescript
const Step4 = () => {
  const serviceFee = selectedAppointment?.servicePrice || 0
  const partsTotal = cartLines.reduce((sum, l) => sum + l.part.price * l.quantity, 0)
  const grandTotal = serviceFee + partsTotal
  
  // Hiển thị: serviceFee, partsTotal, grandTotal, billNumber
}
```

---

## 🔴 PAYOS PAYMENT FLOW (Vấn đề hiện tại)

### Flow:
1. **User chọn appointment** → `selectedAppointment` được set
2. **User chọn parts** → `cartLines` được set
3. **User nhấn "Thanh toán"** → `handlePay()` được gọi
4. **Tạo bill và payment link** → `PaymentApi.createPayOSPayment()`
5. **Redirect đến PayOS** → `window.location.href = checkoutUrl`
   - ⚠️ **STATE BỊ MẤT** vì redirect làm reload page
6. **User thanh toán trên PayOS**
7. **PayOS redirect về** → `/payment/callback?appointmentId=...`
8. **PaymentCallback xử lý** → Fetch payment status, lưu vào localStorage
9. **Redirect về BookingPage** → `/staff/booking?paymentSuccess=true&appointmentId=...`
10. **BookingPage restore state** từ localStorage/URL params

### Tại sao PayOS không show được thông tin?

**Vấn đề: State bị mất sau redirect**

Khi redirect đến PayOS:
- ❌ `selectedAppointment` → **MẤT** (có thể không có `servicePrice`)
- ❌ `cartLines` → **MẤT**
- ❌ `billId` → **MẤT** (có thể có trong localStorage nhưng chưa fetch bill)
- ❌ `billNumber` → **MẤT**

**Khi restore từ callback:**
1. ✅ Có `appointmentId` từ URL/localStorage
2. ✅ Có `billId` từ localStorage (nếu PaymentCallback đã fetch)
3. ❌ **Thiếu**: `selectedAppointment.servicePrice` (nếu appointment trong list không có)
4. ❌ **Thiếu**: `cartLines` (cần fetch từ bill.items)

**Logic restore hiện tại:**
```typescript
// 1. Tìm appointment trong list
const appointment = appointments.find(a => a.id === appointmentId)
if (appointment) {
  // Nếu appointment không có servicePrice → fetch lại
  if (!appointment.servicePrice) {
    // Fetch service/servicePackage để lấy price
  }
  setSelectedAppointment(appointment)
}

// 2. Fetch bill để restore cartLines
if (billId) {
  const bill = await BillApi.getById(billId)
  // Restore cartLines từ bill.items
  const restoredCartLines = bill.items.map(item => {
    // Fetch part từ partID
    // Return CartLine
  })
  setCartLines(restoredCartLines)
}
```

**Vấn đề có thể xảy ra:**
1. ❌ Appointment không có trong `appointments` list → Cần fetch full appointment
2. ❌ Appointment không có `servicePrice` → Cần fetch service/servicePackage
3. ❌ Bill không có `items` hoặc `items` rỗng → Không restore được cartLines
4. ❌ `partID` trong bill.items là ObjectId → Cần convert đúng format
5. ❌ Part không fetch được → CartLines rỗng

---

## ✅ GIẢI PHÁP ĐÃ ÁP DỤNG

### 1. Fix "Đang thanh toán..." stuck:
- ✅ Reset `isPaying(false)` trước khi redirect PayOS
- ✅ Reset `isPaying(false)` khi component mount (callback)
- ✅ Reset `isPaying(false)` sau khi cash payment thành công/thất bại

### 2. Cải thiện restore logic:
- ✅ Fetch full appointment nếu không có trong list
- ✅ Fetch service/servicePackage nếu appointment thiếu `servicePrice`
- ✅ Fetch bill và restore cartLines từ bill.items
- ✅ Xử lý ObjectId conversion cho partID
- ✅ Thêm logging để debug

### 3. Backend:
- ✅ Thêm route `GET /bills/:id` để fetch bill
- ✅ Trả về `billID` trong payment response

---

## 🔍 DEBUG CHECKLIST

Khi PayOS payment không show thông tin, kiểm tra:

1. **Console logs:**
   - `📄 Bill response:` - Bill có items không?
   - `📦 Part IDs to fetch:` - PartIds có đúng không?
   - `✅ Fetched part:` - Parts có fetch được không?
   - `✅ Restored cartLines:` - CartLines có restore được không?
   - `📊 State before step 4:` - Tất cả state có đúng không?

2. **State values:**
   - `selectedAppointment?.servicePrice` - Có giá trị không?
   - `cartLines.length` - Có items không?
   - `billId` - Có billId không?
   - `billNumber` - Có billNumber không?

3. **Bill data:**
   - Bill có `items` không?
   - `items[].partID` có đúng format không?
   - `items[].quantity` có đúng không?

---

## 📝 KẾT LUẬN

**Cash Payment hoạt động tốt vì:**
- State được giữ nguyên trong cùng một session
- Không có redirect làm mất state

**PayOS Payment cần restore state vì:**
- Redirect đến PayOS làm mất state
- Cần fetch lại appointment, bill, và parts từ database
- Logic restore phức tạp hơn và dễ bị lỗi

**Giải pháp:**
- Đảm bảo restore đầy đủ: appointment (với servicePrice), cartLines (từ bill.items)
- Thêm error handling và logging
- Test kỹ các trường hợp edge case

