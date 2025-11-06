export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'awaiting_payment' | 'completed' | 'cancelled' | 'no_show';

export interface CreateAppointmentRequest {
    userID: string;
    vehicleID?: string;
    serviceID?: string;
    servicePackageID?: string;
    bookingDate: string;
    reason?: string;
}

export interface AppointmentResponse {
    _id: string;
    userID: string;
    vehicleID: string;
    serviceID?: string;
    servicePackageID?: string;
    technicianLeaderID?: string;
    technicianSupport1ID?: string;
    technicianSupport2ID?: string;
    bookingDate: string;
    status: AppointmentStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateAppointmentStatusRequest {
    status: AppointmentStatus;
}
