import mongoose, { Schema, Document } from 'mongoose';

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface IAppointment extends Document {
  userID: mongoose.Types.ObjectId; // ref User who booked
  vehicleID?: mongoose.Types.ObjectId; // ref Vehicle (optional if not modeled yet)
  technicianLeaderID?: mongoose.Types.ObjectId; // ref Technician
  technicianSupport1ID?: mongoose.Types.ObjectId; // ref Technician
  technicianSupport2ID?: mongoose.Types.ObjectId; // ref Technician
  serviceID?: mongoose.Types.ObjectId; // ref Service
  servicePackageID?: mongoose.Types.ObjectId; // ref ServicePackage
  bookingDate: Date;
  status: AppointmentStatus;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    // MongoDB provides _id by default; no need for custom appointmentID
    userID: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    vehicleID: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    technicianLeaderID: { type: Schema.Types.ObjectId, ref: 'Technician' },
    technicianSupport1ID: { type: Schema.Types.ObjectId, ref: 'Technician' },
    technicianSupport2ID: { type: Schema.Types.ObjectId, ref: 'Technician' },
    serviceID: { type: Schema.Types.ObjectId, ref: 'Service' },
    servicePackageID: { type: Schema.Types.ObjectId, ref: 'ServicePackage' },
    bookingDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

// Useful compound indexes for queries (user appointments in a day, etc.)
AppointmentSchema.index({ userID: 1, bookingDate: -1 });
AppointmentSchema.index({ technicianLeaderID: 1, bookingDate: -1 });

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);


