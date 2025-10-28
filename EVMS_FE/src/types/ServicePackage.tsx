import type { ServiceResponse } from "./Service";
import type { VehicleCategory } from "./Vehicle";

export type ServicePackageStatus = 'active' | 'inactive' | 'hidden';

export interface ServicePackageResponse {
  _id: string;
  name: string;
  description: string;
  vehicleCategory: VehicleCategory;
  price: number; // using Number for simplicity; can switch to Decimal128 if needed
  duration: number; // minutes or hours depending on business rule
  discount: number; // percentage discount, optional
  status: ServicePackageStatus
  services: ServiceResponse[];
  createAt: string;
  updateAt: string;
}