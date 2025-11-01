export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface CreateAppointmentRequest {
    userID: string;
    vehicleID: string;
    serviceID?: string;
    servicePackageID?: string;
    bookingDate: string;
    reason?: string;
}

export interface AppointmentResponse {
    _id: string;
    userID?: string;
    vehicleID?: string;
    serviceID?: string;
    servicePackageID?: string;
    bookingDate: string;
    status: AppointmentStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateAppointmentStatusRequest {
    status: AppointmentStatus;
}
