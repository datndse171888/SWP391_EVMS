import mongoose, { Schema, Document } from 'mongoose';

export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface BillItem {
  partID: mongoose.Types.ObjectId;
  inventoryID?: mongoose.Types.ObjectId;
  partName: string;
  partNumber: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface IBill extends Document {
  appointmentID: mongoose.Types.ObjectId;
  billNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: BillItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: BillStatus;
}

const BillItemSchema = new Schema<BillItem>(
  {
    partID: { type: Schema.Types.ObjectId, ref: 'Part', required: true, index: true },
    inventoryID: { type: Schema.Types.ObjectId, ref: 'Inventory', index: true },
    partName: { type: String, required: true },
    partNumber: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const BillSchema = new Schema<IBill>(
  {
    appointmentID: { type: Schema.Types.ObjectId, required: true, ref: 'Appointment', index: true },
    billNumber: { type: String, required: true, unique: true, index: true },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    items: { type: [BillItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['pending', 'paid', 'overdue', 'cancelled'], default: 'pending', index: true },
  },
  { timestamps: true }
);

export const Bill = mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);

