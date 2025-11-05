import type { AppointmentResponse } from "./Appoitment";
import type { TechnicianResponse } from "./Technician";

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface ChecklistRequest {
    appointmentID: string;
    tasks: Task[];
}

export interface ChecklistResponse {
    _id: string;
    appointmentID: AppointmentResponse;
    technicianID: TechnicianResponse;
    taskName: string;
    description: string;
    status: TaskStatus;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    taskName: string;
    description: string;
    note: string;
}