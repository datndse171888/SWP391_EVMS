import mongoose, { Schema, Document } from 'mongoose';

export type TechnicianRole = 'leader' | 'member';

export interface ITechnician extends Document {
  userID: mongoose.Types.ObjectId;
  introduction: string;
  role: TechnicianRole;
  experience: number;
  startDate: Date;
}

const TechnicianSchema = new Schema<ITechnician>(
  {
    userID: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    introduction: { type: String, required: true },
    role: { type: String, required: true, enum: ['leader', 'member'], index: true },
    experience: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Technician = mongoose.models.Technician || mongoose.model<ITechnician>('Technician', TechnicianSchema);
