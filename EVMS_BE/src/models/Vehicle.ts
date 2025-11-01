import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
  userID: mongoose.Types.ObjectId;
  VIN: string;
  vehicleCategory: 'CAR' | 'BICYCLE' | 'MOTOBIKE';
  plateNumber: string;
  brand: string;
  year: number;
  mileage: number;
  batteryCapacity: number;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    VIN: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    vehicleCategory: {
      type: String,
      required: true,
      enum: ['CAR', 'BICYCLE', 'MOTOBIKE'],
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    mileage: {
      type: Number,
      required: true,
      min: 0,
      max: 9999999,
    },
    batteryCapacity: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'retired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);

