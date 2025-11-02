import type { AppointmentResponse, AppointmentStatus, CreateAppointmentRequest, UpdateAppointmentStatusRequest } from "../types/Appoitment";
import { api } from "../utils/Axios";

export const AppointmentApi = {
  createAppointment: (data: CreateAppointmentRequest) => {
    return api.post<AppointmentResponse>('/appointments', data);
  },

  getAppointmentsByStatus: (status: AppointmentStatus) => {
    return api.get<AppointmentResponse>(`/appointments?status=${status}`);
  },

  getAppointmentByMe: () => {
    return api.get<AppointmentResponse>('/appointments/me');
  },

  getAppointmentByUserId: (userId: string) => {
    return api.get<AppointmentResponse>(`/appointments/user/${userId}?sort=bookingDate&order=desc`);
  },

  updateAppointmentStatus: (appointmentId: string, request: UpdateAppointmentStatusRequest) => {
    return api.patch<AppointmentResponse>(`/appointments/${appointmentId}/status`, request);
  }
};