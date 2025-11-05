import mongoose, { Schema, Document } from 'mongoose';

export type ChecklistStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface IChecklist extends Document {
  appointmentID: mongoose.Types.ObjectId; // ref Appointment
  technicianID: mongoose.Types.ObjectId; // ref Technician
  taskName: string;
  description: string;
  status: ChecklistStatus;
  startedAt?: Date;
  completedAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistSchema = new Schema<IChecklist>(
  {
    appointmentID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Appointment',
      index: true,
    },
    technicianID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Technician',
      index: true,
    },
    taskName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending',
      index: true,
    },
    startedAt: {
      type: Date,
      required: false,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    note: {
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
ChecklistSchema.index({ appointmentID: 1, technicianID: 1 });
ChecklistSchema.index({ technicianID: 1, status: 1 });
ChecklistSchema.index({ appointmentID: 1, status: 1 });

export const Checklist =
  mongoose.models.Checklist ||
  mongoose.model<IChecklist>('Checklist', ChecklistSchema);


