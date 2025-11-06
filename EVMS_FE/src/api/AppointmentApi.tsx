import type { AppointmentResponse, AppointmentStatus, CreateAppointmentRequest, UpdateAppointmentStatusRequest } from "../types/Appoitment";
import type { FilteredDataResponse } from "../types/DataResponse";
import { api } from "../utils/Axios";

export const AppointmentApi = {
  createAppointment: (data: CreateAppointmentRequest) => {
    return api.post<AppointmentResponse>('/appointments', data);
  },

  getAllAppointments: (status?: AppointmentStatus) => {
    return api.get<FilteredDataResponse<AppointmentResponse>>('/appointments' + (status ? `?status=${status}` : ''));
  },

  getAppointmentByMe: () => {
    return api.get<FilteredDataResponse<AppointmentResponse>>('/appointments/me');
  },

  getAppointmentByTechnician: (status?: AppointmentStatus) => {
    const statusQuery = status ? `status=${status}` : '';
    const includeQuery = 'include=user,service,package,technicians';
    const query = [statusQuery, includeQuery].filter(Boolean).join('&');
    return api.get<AppointmentResponse[]>(`/appointments/technician/me${query ? `?${query}` : ''}`);
  },

  getAppointmentById: (appointmentId: string, include?: string) => {
    const query = include ? `?include=${include}` : '';
    return api.get<{ data: AppointmentResponse }>(`/appointments/${appointmentId}${query}`);
  },

  getTodayAwaitingPayment: () => {
    return api.get<FilteredDataResponse<AppointmentResponse>>('/appointments/today/awaiting-payment');
  },

  getAppointmentByUserId: (userId: string) => {
    return api.get<AppointmentResponse>(`/appointments/user/${userId}?sort=bookingDate&order=desc`);
  },

  updateAppointmentStatus: (appointmentId: string, request: UpdateAppointmentStatusRequest) => {
    return api.patch<AppointmentResponse>(`/appointments/${appointmentId}/status`, request);
  },

  cancelAppointment: (appointmentId: string) => {
    return api.patch<AppointmentResponse>(`/appointments/${appointmentId}/cancel`);
  }
};