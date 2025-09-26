import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userName: string;
  email: string;
  passwordHash: string;
  photoURL?: string;
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  gender?: string;
  isDisabled: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    userName: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    photoURL: { type: String },
    fullName: { type: String },
    phoneNumber: { type: String },
    role: { type: String, default: 'user' },
    gender: { type: String },
    isDisabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


