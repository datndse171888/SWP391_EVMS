import mongoose, { Schema, Document } from 'mongoose';

export type ServiceStatus = 'active' | 'inactive' | 'hidden';
export type VehicleType = 'electric_bike' | 'electric_motorcycle' | 'electric_car';

export interface IService extends Document {
  name: string;
  price: number;
  duration: number;
  description?: string;
  image?: string;
  status: ServiceStatus;
  vehicleType: VehicleType;
}

const ServiceSchema = new Schema<IService>(
  {
    // MongoDB provides _id by default; no separate serviceID needed
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'hidden'], default: 'active', index: true },
    vehicleType: { type: String, enum: ['electric_bike', 'electric_motorcycle', 'electric_car'], required: true, index: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);


