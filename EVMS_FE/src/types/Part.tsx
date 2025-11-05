export interface Part {
  id: string;
  name: string;
  description?: string;
  manufacturer?: string;
  partNumber?: string;
  price: number;
  status: 'active' | 'inactive' | 'hidden';
  warrantyPeriod?: number;
  warrantyCondition?: string;
  stockQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartUsage {
  id: string;
  appointmentID: string;
  partID: string;
  quantity: number;
  priceAtUsage: number;
  warrantyApplied: boolean;
  note?: string;
  warrantyExpiryDate?: string;
  createdAt: string;
}