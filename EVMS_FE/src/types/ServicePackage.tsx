import type { ServiceResponse } from "./Service";
import type { VehicleCategory } from "./Vehicle";

export type ServicePackageStatus = 'active' | 'inactive' | 'hidden';

export interface ServicePackageResponse {
  _id: string;
  name: string;
  description: string;
  vehicleCategory: VehicleCategory;
  price: number;
  duration: number;
  discount: number;
  status: ServicePackageStatus;
  services: ServiceResponse[] | string[]; // Can be populated or just IDs
  periodicEnabled?: boolean;
  intervalMonths?: number;
  defaultTotalVisits?: number;
  createAt?: string;
  updateAt?: string;
}