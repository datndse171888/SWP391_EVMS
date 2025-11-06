import type { AppointmentResponse, AppointmentStatus, CreateAppointmentRequest, UpdateAppointmentStatusRequest } from "../types/Appoitment";
import type { FilteredDataResponse, CheckingResponse } from "../types/DataResponse";
import type { ServiceResponse } from "../types/Service";
import type { ServicePackageResponse } from "../types/ServicePackage";
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

  getAppointmentByTechnician: () => {
    return api.get<AppointmentResponse[]>('/appointments/technician/me');
  },

  getAppointmentById: (appointmentId: string) => {
    return api.get<AppointmentResponse>(`/appointments/${appointmentId}`);
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
  },

  getServiceByAppointmentId: (appointmentId: string) => {
    return api.get<CheckingResponse<{
      type: 'service' | 'servicePackage';
      service?: ServiceResponse;
      servicePackage?: ServicePackageResponse;
    }>>(`/appointments/${appointmentId}/service`);
  }
};