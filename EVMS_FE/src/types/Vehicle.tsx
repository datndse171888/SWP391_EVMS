import type { UserIDObject } from './Account';

export type VehicleCategory = 'CAR' | 'BICYCLE' | 'MOTOBIKE';
export type VehicleStatus = 'active' | 'inactive' | 'maintenance' | 'retired';

export interface VehicleService {
    icon: React.ElementType;
    title: string;
    description: string;
    features: string[];
    image: string;
}

export interface VehicleResponse {
    _id: string;
    userID: UserIDObject;
    VIN: string;
    vehicleType: VehicleCategory;
    plateNumber: string;
    brand: string;
    year: number;
    mileage: number;
    batteryCapacity: number;
    status: VehicleStatus;
    createdAt: string;
    updatedAt: string;
}

export interface VehicleRequest {
  VIN: string;
  vehicleCategory: VehicleCategory;
  plateNumber: string;
  brand: string;
  year: number;
  mileage: number;
  batteryCapacity: number;
  status: VehicleStatus
}

