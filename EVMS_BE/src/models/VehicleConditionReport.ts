import mongoose, { Schema, Document } from 'mongoose';

export type VehicleConditionReportStage = 'before-service' | 'after-service';

export interface IVehicleConditionReport extends Document {
  appointmentID: mongoose.Types.ObjectId; // ref Appointment
  technicianId: mongoose.Types.ObjectId; // ref Technician
  stage: VehicleConditionReportStage;
  details: string;
  image: string;
  createdAt: Date;
}

const VehicleConditionReportSchema = new Schema<IVehicleConditionReport>(
  {
    appointmentID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Appointment',
      index: true,
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Technician',
      index: true,
    },
    stage: {
      type: String,
      required: true,
      enum: ['before-service', 'after-service'],
      index: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Compound indexes for queries
VehicleConditionReportSchema.index({ appointmentID: 1, stage: 1 });
VehicleConditionReportSchema.index({ technicianId: 1, createdAt: -1 });

export const VehicleConditionReport =
  mongoose.models.VehicleConditionReport ||
  mongoose.model<IVehicleConditionReport>('VehicleConditionReport', VehicleConditionReportSchema);

