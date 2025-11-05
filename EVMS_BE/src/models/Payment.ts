import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = 'CASH' | 'PAYOS';
export type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'failed';

export interface IPayment extends Document {
  appointmentID: mongoose.Types.ObjectId; // ref Appointment
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentLinkId?: string; // PayOS payment link ID
  payOSData?: {
    code: string;
    desc: string;
    data?: any;
  };
  note?: string;
  completedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    appointmentID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Appointment',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['CASH', 'PAYOS'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'cancelled', 'failed'],
      default: 'pending',
      index: true,
    },
    paymentLinkId: {
      type: String,
      sparse: true,
      index: true,
    },
    payOSData: {
      code: String,
      desc: String,
      data: Schema.Types.Mixed,
    },
    note: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

