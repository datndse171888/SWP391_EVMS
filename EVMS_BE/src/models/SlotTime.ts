import mongoose, { Schema, Document } from 'mongoose';

export type SlotTimeStatus = 'available' | 'booked' | 'cancelled' | 'completed';

export interface ISlotTime extends Document {
  technicianID: mongoose.Types.ObjectId; // ref Technician
  startTime: Date;
  endTime: Date;
  status: SlotTimeStatus;
}

const SlotTimeSchema = new Schema<ISlotTime>(
  {
    // MongoDB provides _id by default; no need for custom slotTimeID
    technicianID: { type: Schema.Types.ObjectId, required: true, ref: 'Technician', index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['available', 'booked', 'cancelled', 'completed'],
      default: 'available',
      index: true,
    },
  },
  { timestamps: true }
);

// Useful compound indexes for queries
SlotTimeSchema.index({ technicianID: 1, startTime: 1, endTime: 1 });
SlotTimeSchema.index({ status: 1, startTime: 1 });
SlotTimeSchema.index({ startTime: 1, endTime: 1 });

export const SlotTime = mongoose.models.SlotTime || mongoose.model<ISlotTime>('SlotTime', SlotTimeSchema);

