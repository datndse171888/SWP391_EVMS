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
  createdAt?: string;
  updatedAt?: string;
}


