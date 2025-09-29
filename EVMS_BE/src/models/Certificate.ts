import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  certificateID: mongoose.Types.ObjectId;
  name: string;
  description: string;
  issuingAuthority: string;
  validityPeriod: number; // in months
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateID: { type: Schema.Types.ObjectId, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    issuingAuthority: { type: String, required: true },
    validityPeriod: { type: Number, required: true, min: 1 }, // in months
  },
  { timestamps: true }
);

export const Certificate = mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema);
