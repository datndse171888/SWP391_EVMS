import { api } from '../utils/Axios'

export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export interface BillResponse {
  _id: string
  appointmentID: string
  billNumber: string
  issueDate: string
  dueDate: string
  subtotal: number
  tax: number
  totalAmount: number
  status: BillStatus
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface BillItem {
  partID: string
  inventoryID?: string
  partName: string
  partNumber: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

// Simplified item interface for creating bill - chỉ cần partID và quantity
// Backend sẽ tự động lấy thông tin Part từ database
export interface CreateBillItem {
  partID: string
  quantity: number
  inventoryID?: string // optional
}

export interface CreateBillRequest {
  appointmentID: string
  items?: CreateBillItem[] // Chỉ cần partID và quantity
  subtotal: number
  tax?: number
  totalAmount?: number
  dueDate?: string
  description?: string // Ghi chú/mô tả cho bill
}

export const BillApi = {
  createBill(data: CreateBillRequest) {
    return api.post<{ message: string; bill: BillResponse }>('/bills', data)
  },

  getById(id: string) {
    return api.get<{ data: BillResponse & { items?: BillItem[] } }>(`/bills/${id}`)
  },

  updateBillStatus(id: string, status: BillStatus) {
    return api.patch<{ message: string; bill: BillResponse }>(`/bills/${id}/status`, { status })
  },
}


