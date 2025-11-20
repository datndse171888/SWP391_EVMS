import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  userID: mongoose.Types.ObjectId;
  rating: number; // 1-5 stars
  comment: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminResponse?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
      index: true,
    },
    adminResponse: {
      type: String,
      trim: true,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
FeedbackSchema.index({ userID: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ rating: 1 });

export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

