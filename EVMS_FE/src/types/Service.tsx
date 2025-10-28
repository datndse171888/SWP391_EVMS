import type { VehicleCategory } from "./Vehicle";

export interface ServiceResponse {
  _id: string;
  name: string;
  price: number;
  vehicleCategory: VehicleCategory;
  duration: number;
  description: string;
  image: string;
}


