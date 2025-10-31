import mongoose, { Schema, Document, Types } from 'mongoose';

export type ChecklistStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface IChecklist extends Document {
  appointmentID: Types.ObjectId;
  technicianID: Types.ObjectId;
  taskName: string;
  description?: string;
  status: ChecklistStatus;
  startedAt?: Date;
  completedAt?: Date;
  note?: string;
  createAt?: Date;
  updateAt?: Date;
}

const ChecklistSchema = new Schema<IChecklist>(
  {
    appointmentID: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    technicianID: { type: Schema.Types.ObjectId, ref: 'Technician', required: true, index: true },
    taskName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'skipped'], default: 'pending', index: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    note: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } }
);

export const Checklist =
  mongoose.models.Checklist || mongoose.model<IChecklist>('Checklist', ChecklistSchema);


