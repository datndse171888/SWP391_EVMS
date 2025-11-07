import mongoose, { Schema, Document, Types } from 'mongoose';

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface IInventory extends Document {
  partID: Types.ObjectId;
  quantity: number;
  status: InventoryStatus;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    partID: { type: Schema.Types.ObjectId, ref: 'Part', required: true, index: true },
    quantity: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'out_of_stock',
      index: true,
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);


export const Inventory = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);


