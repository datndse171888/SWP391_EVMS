import mongoose, { Schema, Document } from 'mongoose';

export type ServiceStatus = 'active' | 'inactive' | 'hidden';
export type VehicleCategory = 'CAR' | 'BICYCLE' | 'MOTOBIKE';

export interface IService extends Document {
  name: string;
  price: number;
  vehicleCategory: VehicleCategory;
  duration: number;
  description?: string;
  image?: string;
}

const ServiceSchema = new Schema<IService>(
  {
    // MongoDB provides _id by default; no separate serviceID needed
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    vehicleCategory: { type: String, enum: ['CAR', 'BICYCLE', 'MOTOBIKE'], required: true, index: true },
    duration: { type: Number, required: true, min: 1 },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);


