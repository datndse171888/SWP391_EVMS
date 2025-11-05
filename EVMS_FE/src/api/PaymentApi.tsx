import type { CheckingResponse } from '../types/DataResponse'
import { api } from '../utils/Axios'

export interface CreatePaymentRequest {
  appointmentId: string
  amount: number
  description: string
  returnUrl: string
  cancelUrl: string
  note?: string
}

export interface PayOSPaymentResponse {
  paymentLinkId: string
  checkoutUrl: string
  qrCode: string
}

export interface PaymentResponse {
  id: string
  appointmentId: string
  amount: number
  paymentMethod: 'CASH' | 'PAYOS'
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  paymentLinkId?: string
  createdAt: string
  updatedAt: string
}

export const PaymentApi = {
  // Tạo payment link từ PayOS (chỉ dùng cho PAYOS)
  createPayOSPayment: (data: CreatePaymentRequest) => {
    return api.post<CheckingResponse<PayOSPaymentResponse>>('/payments/payos/create', data)
  },

  // Xác nhận thanh toán tiền mặt theo billId (BE lấy amount và appointmentID từ bill)
  confirmCashPayment: (data: { billId: string; note?: string }) => {
    return api.post<CheckingResponse<PaymentResponse>>('/payments/cash/confirm', data)
  },

  // Kiểm tra trạng thái payment
  getPaymentStatus: (paymentLinkId: string) => {
    return api.get<CheckingResponse<PaymentResponse>>(`/payments/status/${paymentLinkId}`)
  },

  // Xác nhận payment từ PayOS callback
  confirmPayOSPayment: (paymentLinkId: string) => {
    return api.post<CheckingResponse<PaymentResponse>>(`/payments/payos/confirm/${paymentLinkId}`)
  },
}

