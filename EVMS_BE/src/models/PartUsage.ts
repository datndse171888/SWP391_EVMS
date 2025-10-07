import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPartUsage extends Document {
  appointmentID: Types.ObjectId;
  partID: Types.ObjectId;
  quantity: number;
  priceAtUsage: number;
  warrantyApplied: boolean;
  note?: string;
  warrantyExpiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PartUsageSchema = new Schema<IPartUsage>(
  {
    appointmentID: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    partID: { type: Schema.Types.ObjectId, ref: 'Part', required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtUsage: { type: Number, required: true, min: 0 },
    warrantyApplied: { type: Boolean, default: false },
    note: { type: String, trim: true },
    warrantyExpiryDate: { type: Date },
  },
  { timestamps: true }
);

// A given appointment can use the same part multiple times; if you want to avoid duplicates, uncomment the unique index below
// PartUsageSchema.index({ appointmentID: 1, partID: 1 }, { unique: true });

export const PartUsage = mongoose.models.PartUsage || mongoose.model<IPartUsage>('PartUsage', PartUsageSchema);


