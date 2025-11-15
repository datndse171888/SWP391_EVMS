import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationID: mongoose.Types.ObjectId;
  senderID: mongoose.Types.ObjectId; // ref User
  content: string;
  imageUrl?: string; // Optional single image URL (for backward compatibility)
  imageUrls?: string[]; // Optional array of image URLs
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationID: { type: Schema.Types.ObjectId, required: true, ref: 'Conversation' },
    senderID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    imageUrls: [{ type: String, trim: true }],
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);


