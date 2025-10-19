import mongoose, { Schema, Document } from 'mongoose';

export type VcrStage = 'before-service' | 'after-service' | 'intermediate';

export interface IVehicleConditionReport extends Document {
  appointmentID: mongoose.Types.ObjectId;
  technicianID: mongoose.Types.ObjectId;
  stage: VcrStage;
  details?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VcrSchema = new Schema<IVehicleConditionReport>(
  {
    appointmentID: { 
      type: Schema.Types.ObjectId, 
      ref: 'Appointment', 
      required: true, 
      index: true 
    },
    technicianID: { 
      type: Schema.Types.ObjectId, 
      ref: 'Technician', 
      required: true, 
      index: true 
    },
    stage: { 
      type: String, 
      enum: ['before-service', 'after-service', 'intermediate'], 
      required: true, 
      index: true 
    },
    details: { 
      type: String, 
      trim: true 
    },
    images: { 
      type: [String], 
      default: [] 
    }
  },
  { timestamps: true }
);

// Unique constraint: mỗi appointment chỉ có 1 before-service và 1 after-service
VcrSchema.index(
  { appointmentID: 1, stage: 1 },
  { 
    unique: true, 
    partialFilterExpression: { 
      stage: { $in: ['before-service', 'after-service'] } 
    } 
  }
);

// Compound indexes for performance
VcrSchema.index({ appointmentID: 1, createdAt: -1 });
VcrSchema.index({ technicianID: 1, createdAt: -1 });
VcrSchema.index({ stage: 1, createdAt: -1 });

export const VehicleConditionReport =
  mongoose.models.VehicleConditionReport ||
  mongoose.model<IVehicleConditionReport>('VehicleConditionReport', VcrSchema);
