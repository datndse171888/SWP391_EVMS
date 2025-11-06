# Hướng dẫn tích hợp PayOS

## Quick Start (Local Development)

1. **Chạy tunnel cho Backend:**
   ```bash
   cloudflared tunnel --url http://localhost:4000
   ```
   Copy URL nhận được (ví dụ: `https://xxxx.trycloudflare.com`)

2. **Chạy tunnel cho Frontend (terminal khác):**
   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```
   Copy URL nhận được (ví dụ: `https://yyyy.trycloudflare.com`)

3. **Cấu hình Backend `.env`:**
   ```env
   PAYOS_CLIENT_ID=your_client_id
   PAYOS_API_KEY=your_api_key
   PAYOS_CHECKSUM_KEY=your_checksum_key
   BACKEND_WEBHOOK_URL=https://xxxx.trycloudflare.com/api/payments/webhook
   ```

4. **Cấu hình Frontend `.env`:**
   ```env
   VITE_FRONTEND_BASE_URL=https://yyyy.trycloudflare.com
   ```

5. **Cấu hình PayOS Dashboard:**
   - Vào Webhook settings
   - Thêm URL: `https://xxxx.trycloudflare.com/api/payments/webhook`

6. **Restart cả backend và frontend** để load env variables mới

---

## 1. Đăng ký tài khoản PayOS

1. Truy cập https://payos.vn và đăng ký tài khoản merchant
2. Sau khi đăng ký, bạn sẽ nhận được:
   - **Client ID** (x-client-id)
   - **API Key** (x-api-key)
   - **Checksum Key** (để verify webhook)

## 2. Cấu hình cho Local Development (với Tunnel)

Khi chạy local, PayOS không thể trực tiếp gọi về `localhost`. Bạn cần sử dụng **tunnel service** để expose local server ra internet.

### 2.1. Setup Tunnel (Chọn một trong các cách)

#### Cách 1: Cloudflare Tunnel (Cloudflared) - Khuyến nghị

1. Download Cloudflared:
   - Windows: https://github.com/cloudflare/cloudflare tunnel releases
   - Hoặc dùng: `winget install --id Cloudflare.cloudflared`
   - Hoặc dùng: `choco install cloudflared`

2. Chạy tunnel cho Backend:
   ```bash
   cloudflared-windows-amd64.exe tunnel --url http://localhost:4000
   ```
   Sẽ nhận được URL dạng: `https://xxxx-xx-xx-xx-xx.xx.trycloudflare.com`

3. Chạy tunnel cho Frontend (nếu cần):
   ```bash
   cloudflared-windows-amd64.exe tunnel --url http://localhost:5173
   ```
   Sẽ nhận được URL dạng: `https://yyyy-yy-yy-yy-yy.yy.trycloudflare.com`

#### Cách 2: Ngrok

1. Đăng ký tại https://ngrok.com
2. Download và cài đặt ngrok
3. Chạy:
   ```bash
   ngrok http 4000  # Cho backend
   ngrok http 5173  # Cho frontend (terminal khác)
   ```

#### Cách 3: LocalTunnel

```bash
npx localtunnel --port 4000  # Cho backend
npx localtunnel --port 5173  # Cho frontend
```

### 2.2. Cấu hình Environment Variables

#### Backend (EVMS_BE)

Thêm vào file `.env` hoặc `.env.local`:

```env
# PayOS Credentials
PAYOS_CLIENT_ID=your_client_id_here
PAYOS_API_KEY=your_api_key_here
PAYOS_CHECKSUM_KEY=your_checksum_key_here
PAYOS_BASE_URL=https://api-merchant.payos.vn

# Tunnel URL cho webhook (dùng tunnel URL của backend)
BACKEND_WEBHOOK_URL=https://xxxx-xx-xx-xx-xx.xx.trycloudflare.com/api/payments/webhook
```

**Lưu ý:**
- `BACKEND_WEBHOOK_URL` là URL đầy đủ để PayOS gọi webhook về
- Thay `xxxx-xx-xx-xx-xx.xx.trycloudflare.com` bằng tunnel URL thực tế của bạn
- Production: `BACKEND_WEBHOOK_URL=https://your-domain.com/api/payments/webhook`

#### Frontend (EVMS_FE)

Thêm vào file `.env` hoặc `.env.local`:

```env
# Tunnel URL cho frontend (dùng tunnel URL của frontend)
VITE_FRONTEND_BASE_URL=https://yyyy-yy-yy-yy-yy.yy.trycloudflare.com
```

**Lưu ý:**
- `VITE_FRONTEND_BASE_URL` là URL để PayOS redirect về sau khi thanh toán
- Thay `yyyy-yy-yy-yy-yy.yy.trycloudflare.com` bằng tunnel URL thực tế của bạn
- Nếu không set, sẽ dùng `window.location.origin` (chỉ hoạt động khi chạy production)

### 2.3. Cấu hình PayOS Dashboard

1. Đăng nhập PayOS dashboard
2. Vào mục **Webhook** hoặc **Cài đặt**
3. Thêm webhook URL: Sử dụng `BACKEND_WEBHOOK_URL` từ `.env` của backend
   - Ví dụ: `https://xxxx-xx-xx-xx-xx.xx.trycloudflare.com/api/payments/webhook`

## 3. Cài đặt dependencies (nếu cần)

### Backend - Sử dụng PayOS SDK (tùy chọn)

```bash
cd EVMS_BE
npm install @payos/node
```

**Lưu ý:** Code hiện tại đã implement bằng fetch API, không cần SDK. Nếu muốn dùng SDK, bạn có thể refactor code trong `paymentController.ts`.

## 4. Cấu hình Webhook

**Lưu ý:** Nếu đã cấu hình ở bước 2.3 thì bỏ qua bước này.

1. Đăng nhập vào PayOS dashboard
2. Vào mục **Webhook** hoặc **Cài đặt**
3. Thêm webhook URL:
   - **Local development:** Dùng `BACKEND_WEBHOOK_URL` từ `.env` (tunnel URL)
   - **Production:** `https://your-domain.com/api/payments/webhook`
4. PayOS sẽ gửi notification về payment status qua webhook này

## 5. Luồng thanh toán

### Tiền mặt (CASH)
1. User chọn "Tiền mặt"
2. Click "Thanh toán"
3. Backend tạo payment record với status = 'completed'
4. Update appointment status = 'completed'
5. Hiển thị kết quả thành công

### PayOS
1. User chọn "PayOS"
2. Click "Thanh toán"
3. Backend tạo payment record với status = 'pending'
4. Backend gọi PayOS API để tạo payment link
5. Frontend redirect user đến PayOS checkout page
6. User thanh toán trên PayOS
7. PayOS redirect về `/payment/callback?appointmentId=xxx&paymentLinkId=xxx`
8. Frontend gọi API để xác nhận payment
9. Backend verify payment với PayOS
10. Update payment và appointment status
11. Hiển thị kết quả

## 6. Testing

### Test với PayOS Sandbox (nếu có)
1. Sử dụng sandbox credentials
2. Test các trường hợp:
   - Thanh toán thành công
   - Thanh toán thất bại
   - User cancel payment
   - Payment timeout

### Test với PayOS Production
1. Đảm bảo đã cấu hình đúng credentials
2. Test với số tiền nhỏ trước
3. Kiểm tra webhook hoạt động đúng

## 7. API Endpoints

### Backend
- `POST /api/payments/payos/create` - Tạo PayOS payment link
- `POST /api/payments/cash/confirm` - Xác nhận thanh toán tiền mặt
- `POST /api/payments/payos/confirm/:paymentLinkId` - Xác nhận PayOS payment
- `GET /api/payments/status/:paymentLinkId` - Lấy trạng thái payment
- `POST /api/payments/webhook` - Webhook endpoint cho PayOS

### Frontend
- `PaymentApi.createPayOSPayment()` - Tạo payment link
- `PaymentApi.confirmCashPayment()` - Xác nhận tiền mặt
- `PaymentApi.confirmPayOSPayment()` - Xác nhận PayOS
- `PaymentApi.getPaymentStatus()` - Lấy trạng thái

## 8. Troubleshooting

### Lỗi "Invalid credentials"
- Kiểm tra lại PAYOS_CLIENT_ID và PAYOS_API_KEY trong .env
- Đảm bảo không có khoảng trắng thừa

### Lỗi "Payment link creation failed"
- Kiểm tra PayOS dashboard xem account có bị giới hạn không
- Kiểm tra số tiền (PayOS chỉ nhận số nguyên, không có decimal)

### Webhook không hoạt động
- Kiểm tra URL webhook có đúng không (phải dùng tunnel URL khi chạy local)
- Đảm bảo tunnel đang chạy và accessible từ internet
- Kiểm tra `BACKEND_WEBHOOK_URL` trong `.env` có đúng không
- Đảm bảo server có thể nhận được request từ PayOS (không bị firewall chặn)
- Kiểm tra logs để xem có request đến không
- Test webhook URL bằng cách truy cập trực tiếp trong browser: `https://your-tunnel-url/api/payments/webhook` (sẽ trả về 405 Method Not Allowed, đó là bình thường)

### PayOS không redirect về được
- Kiểm tra `VITE_FRONTEND_BASE_URL` trong `.env` của frontend
- Đảm bảo tunnel cho frontend đang chạy
- Kiểm tra console/logs để xem returnUrl có đúng không
- Test truy cập trực tiếp tunnel URL của frontend xem có hoạt động không

## 9. Tài liệu tham khảo

- PayOS Documentation: https://payos.vn/docs
- PayOS API Reference: https://payos.vn/docs/api/
- PayOS Node.js SDK: https://github.com/payosHQ/payos-nodejs

## 10. Security Notes

- **KHÔNG** commit credentials vào git
- Sử dụng environment variables cho tất cả sensitive data
- Verify webhook signature nếu PayOS hỗ trợ (đã có comment trong code)
- Validate payment amount ở backend trước khi tạo payment
- Kiểm tra payment status trước khi update appointment

