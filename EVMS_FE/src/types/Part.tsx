export interface Part {
  _id: string;
  name: string;
  description?: string;
  manufacturer?: string;
  partNumber?: string;
  price: number;
  status: 'active' | 'inactive';
  warrantyPeriod?: number;
  warrantyCondition?: string;
  category?: 'tires' | 'oil' | 'filters' | 'brakes' | 'electrical' | 'cooling' | 'suspension' | 'transmission' | 'accessories'
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