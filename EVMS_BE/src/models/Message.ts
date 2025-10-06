import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationID: mongoose.Types.ObjectId;
  senderID: mongoose.Types.ObjectId; // ref User
  content: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationID: { type: Schema.Types.ObjectId, required: true, ref: 'Conversation' },
    senderID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);


