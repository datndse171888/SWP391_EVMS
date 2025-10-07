import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInventory extends Document {
  partID: Types.ObjectId;
  quantity: number;
  updatedAt: Date;
  createdAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    partID: { type: Schema.Types.ObjectId, ref: 'Part', required: true, index: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Each part should have at most one inventory record
InventorySchema.index({ partID: 1 }, { unique: true });

export const Inventory = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);


