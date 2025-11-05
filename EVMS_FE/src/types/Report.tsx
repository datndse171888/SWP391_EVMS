import type { AppointmentResponse } from "./Appoitment";
import type { TechnicianResponse } from "./Technician";

export interface ReportRequest {
    appointmentID: string;
    stage: 'before-service' | 'after-service';
    details: string;
    image?: string;
}

export interface ReportResponse {
    _id: string;
    appointmentID: AppointmentResponse;
    technicianId: TechnicianResponse;
    stage: 'before-service' | 'after-service';
    details: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
}