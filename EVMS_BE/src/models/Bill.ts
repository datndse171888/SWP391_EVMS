import mongoose, { Schema, Document } from 'mongoose';

export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface IBill extends Document {
  appointmentID: mongoose.Types.ObjectId; // ref Appointment
  billNumber: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: BillStatus;
}

const BillSchema = new Schema<IBill>(
  {
    appointmentID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Appointment',
      index: true,
    },
    billNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export const Bill = mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);

