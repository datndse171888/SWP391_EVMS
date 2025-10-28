import type { AppointmentStatus, CreateAppointmentRequest, CreateAppointmentResponse, UpdateAppointmentStatusRequest } from "../types/Appoitment";
import { api } from "../utils/Axios";

export const AppointmentApi = {
  createAppointment: (data: CreateAppointmentRequest) => {
    return api.post<CreateAppointmentResponse>('/appointments ', data);
  },

  getAppointmentsByStatus: (status: AppointmentStatus) => {
    return api.get<CreateAppointmentResponse>(`/appointments?status=${status}`);
  },

  getAppointmentByMe: () => {
    return api.get<CreateAppointmentResponse>('/appointments/me');
  },

  getAppointmentByUserId: (userId: string) => {
    return api.get<CreateAppointmentResponse>(`/appointments?userId=${userId}&sort=bookingDate&order=desc`);
  },

  updateAppointmentStatus: (appointmentId: string, request: UpdateAppointmentStatusRequest) => {
    return api.patch<CreateAppointmentResponse>(`/appointments/${appointmentId}/status`, request);
  }
};