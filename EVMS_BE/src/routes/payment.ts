import { Router } from 'express';
import {
  createPayOSPayment,
  confirmCashPayment,
  confirmPayOSPayment,
  getPaymentStatus,
  handlePayOSWebhook,
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const paymentRouter = Router();

// Webhook endpoint (không cần auth, PayOS sẽ gọi)
paymentRouter.post('/webhook', handlePayOSWebhook);

// Tạo PayOS payment link (cần auth)
paymentRouter.post('/payos/create', authMiddleware, createPayOSPayment);

// Xác nhận thanh toán tiền mặt (cần auth)
paymentRouter.post('/cash/confirm', authMiddleware, confirmCashPayment);

// Xác nhận PayOS payment từ callback (cần auth)
paymentRouter.post('/payos/confirm/:paymentLinkId', authMiddleware, confirmPayOSPayment);

// Lấy trạng thái payment (cần auth)
paymentRouter.get('/status/:paymentLinkId', authMiddleware, getPaymentStatus);

