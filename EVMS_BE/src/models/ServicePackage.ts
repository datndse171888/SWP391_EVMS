import mongoose, { Schema, Document } from 'mongoose';

export type ServicePackageStatus = 'active' | 'inactive' | 'hidden';
export type VehicleCategory = 'CAR' | 'BICYCLE' | 'MOTOBIKE';

export interface IServicePackage extends Document {
  name: string;
  description?: string;
  vehicleCategory: VehicleCategory;
  price: number; // using Number for simplicity; can switch to Decimal128 if needed
  duration: number; // minutes or hours depending on business rule
  discount?: number; // discount amount, default 0
  services?: mongoose.Types.ObjectId[]; // reference to Service collection
  status: ServicePackageStatus;
  createAt?: Date;
  updateAt?: Date;
}

const ServicePackageSchema = new Schema<IServicePackage>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    vehicleCategory: {
      type: String,
      required: true,
      enum: ['CAR', 'BICYCLE', 'MOTOBIKE'],
      message: 'Danh mục xe phải là: CAR, BICYCLE, hoặc MOTOBIKE'
    },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    discount: { type: Number, default: 0, min: 0 },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
      }
    ],
    status: { type: String, enum: ['active', 'inactive', 'hidden'], default: 'active', index: true },
  },
  { timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } }
);

ServicePackageSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const ServicePackage =
  mongoose.models.ServicePackage || mongoose.model<IServicePackage>('ServicePackage', ServicePackageSchema);


