import mongoose, { Schema, Document } from 'mongoose';

export interface ITechnicianCertificate extends Document {
  technicianCertificateID: mongoose.Types.ObjectId;
  technicianID: mongoose.Types.ObjectId;
  certificateID: mongoose.Types.ObjectId;
  issuedDate: Date;
  expiryDate: Date;
  status: string;
  note?: string;
  certificateImage?: string;
}

const TechnicianCertificateSchema = new Schema<ITechnicianCertificate>(
  {
    technicianCertificateID: { type: Schema.Types.ObjectId, required: true, unique: true },
    technicianID: { type: Schema.Types.ObjectId, required: true, ref: 'Technician' },
    certificateID: { type: Schema.Types.ObjectId, required: true, ref: 'Certificate' },
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ['Active', 'Expired', 'Pending', 'Revoked'] },
    note: { type: String },
    certificateImage: { type: String },
  },
  { timestamps: true }
);

export const TechnicianCertificate = mongoose.models.TechnicianCertificate || mongoose.model<ITechnicianCertificate>('TechnicianCertificate', TechnicianCertificateSchema);
