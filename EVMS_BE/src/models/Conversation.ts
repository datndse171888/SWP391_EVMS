import mongoose, { Schema, Document } from 'mongoose';

export type ConversationStatus = 'open' | 'assigned' | 'closed';

export interface IConversation extends Document {
  userID: mongoose.Types.ObjectId;
  staffID?: mongoose.Types.ObjectId | null;
  status: ConversationStatus;
  createdAt: Date;
  closedAt?: Date | null;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    staffID: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['open', 'assigned', 'closed'], default: 'open' },
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
  },
  { timestamps: false }
);

export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);


