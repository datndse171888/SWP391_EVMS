import mongoose, { Schema, Document } from 'mongoose';

export interface ITechnician extends Document {
  technicianID: mongoose.Types.ObjectId;
  userID: mongoose.Types.ObjectId;
  introduction: string;
  role: string;
  experience: number;
  startDate: Date;
}

const TechnicianSchema = new Schema<ITechnician>(
  {
    technicianID: { type: Schema.Types.ObjectId, required: true, unique: true },
    userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    introduction: { type: String, required: true },
    role: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Technician = mongoose.models.Technician || mongoose.model<ITechnician>('Technician', TechnicianSchema);
