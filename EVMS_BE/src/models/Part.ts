import mongoose, { Schema, Document, Types } from 'mongoose';

export type PartStatus = 'active' | 'inactive' | 'hidden';

export interface IPart extends Document {
  name: string;
  description?: string;
  manufacturer?: string;
  partNumber?: string;
  price: number;
  status: PartStatus;
  warrantyPeriod?: number; // months or km, see warrantyCondition
  warrantyCondition?: string; // e.g., "tháng/km"
  createdAt: Date;
  updatedAt: Date;
}

const PartSchema = new Schema<IPart>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    partNumber: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'inactive', 'hidden'], default: 'active', index: true },
    warrantyPeriod: { type: Number, min: 0 },
    warrantyCondition: { type: String, trim: true },
  },
  { timestamps: true }
);

PartSchema.index({ name: 1, partNumber: 1 }, { unique: true, sparse: true, collation: { locale: 'en', strength: 2 } });

export const Part = mongoose.models.Part || mongoose.model<IPart>('Part', PartSchema);


