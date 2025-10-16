import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
  userID: mongoose.Types.ObjectId; // ref User who owns the vehicle
  VIN: string;
  vehicleType: string;
  plateNumber: string;
  brand: string;
  year: number;
  mileage: number;
  batteryCapacity: number;
  status: string;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    userID: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      ref: 'User', 
      index: true 
    },
    VIN: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      uppercase: true,
      validate: {
        validator: function(v: string) {
          // VIN validation: 17 characters, alphanumeric except I, O, Q
          return /^[A-HJ-NPR-Z0-9]{17}$/.test(v);
        },
        message: 'VIN phải có 17 ký tự và chỉ chứa chữ cái và số (trừ I, O, Q)'
      }
    },
    vehicleType: { 
      type: String, 
      required: true, 
      trim: true,
      enum: ['car', 'motorcycle', 'truck', 'bus', 'other'],
      message: 'Loại xe phải là: car, motorcycle, truck, bus, hoặc other'
    },
    plateNumber: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      uppercase: true,
      validate: {
        validator: function(v: string) {
          // Vietnamese license plate validation - supports various formats
          // Format: XX-XXXX.XX (old), XX-XXXXX.XX (new), XX-XXXX.XX (special)
          // Examples: 30A-12345, 29B1-12345, 51G-12345, etc.
          return /^[0-9]{2}[A-Z]{1,2}[0-9]{3,5}$/.test(v);
        },
        message: 'Biển số xe không đúng định dạng Việt Nam (ví dụ: 30A12345, 29B112345)'
      }
    },
    brand: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: [2, 'Tên thương hiệu phải có ít nhất 2 ký tự'],
      maxlength: [50, 'Tên thương hiệu không được quá 50 ký tự']
    },
    year: { 
      type: Number, 
      required: true,
      min: [1900, 'Năm sản xuất phải từ 1900 trở lên'],
      max: [new Date().getFullYear() + 1, 'Năm sản xuất không được vượt quá năm hiện tại + 1']
    },
    mileage: { 
      type: Number, 
      required: true,
      min: [0, 'Số km không được âm'],
      max: [9999999, 'Số km không được vượt quá 9,999,999']
    },
    batteryCapacity: { 
      type: Number, 
      required: true,
      min: [0, 'Dung lượng pin không được âm'],
      max: [1000, 'Dung lượng pin không được vượt quá 1000 kWh']
    },
    status: { 
      type: String, 
      required: true,
      enum: ['active', 'inactive', 'maintenance', 'retired'],
      default: 'active',
      message: 'Trạng thái phải là: active, inactive, maintenance, hoặc retired'
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
VehicleSchema.index({ userID: 1, status: 1 });

export const Vehicle = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
