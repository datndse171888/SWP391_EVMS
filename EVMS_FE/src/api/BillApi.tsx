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

export interface CreateBillRequest {
  appointmentID: string
  items?: BillItem[]
  subtotal: number
  tax?: number
  totalAmount?: number
  dueDate?: string
}

export const BillApi = {
  createBill(data: CreateBillRequest) {
    return api.post<{ message: string; bill: BillResponse }>('/bills', data)
  },

  updateBillStatus(id: string, status: BillStatus) {
    return api.patch<{ message: string; bill: BillResponse }>(`/bills/${id}/status`, { status })
  },
}


