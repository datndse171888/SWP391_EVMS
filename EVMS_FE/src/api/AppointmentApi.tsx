import type { AppointmentResponse, AppointmentStatus, CreateAppointmentRequest, UpdateAppointmentStatusRequest } from "../types/Appoitment";
import type { FilteredDataResponse, CheckingResponse } from "../types/DataResponse";
import type { ServiceResponse } from "../types/Service";
import type { ServicePackageResponse } from "../types/ServicePackage";
import { api } from "../utils/Axios";

type TechnicianOverviewItem = {
  _id?: string;
  bookingDate?: string;
  status?: string;
  userID?: { fullName?: string; userName?: string };
  serviceID?: { name?: string };
  servicePackageID?: { name?: string };
};

type TechnicianOverviewResponse = {
  stats: { totalToday: number; confirmedToday: number; inProgressToday: number };
  inventory: { totalLowStock: number; totalInStock: number };
  progress: { assignedCount: number; completedCount: number; completionRate: number };
  performance: { label: string; completed: number }[];
  upcoming: TechnicianOverviewItem[];
  range: string;
};

// ===== Nhắc hẹn bảo dưỡng - Types & API =====
export type DueStatus = 'overdue' | 'dueToday' | 'upcoming';
export type ReminderType = 'periodic' | 'vehicleschedule' | 'all';

export interface NextAppointmentLite {
  _id: string;
  bookingDate: string;
  status: string;
  userID: string;
  vehicleID: string;
  serviceID?: string;
  servicePackageID?: string;
}

export interface PeriodicSummary {
  serviceType: 'service' | 'servicePackage';
  serviceId: string;
  serviceName?: string;
  totalVisits?: number;
  completedVisits?: number;
  remainingVisits?: number;
  intervalMonths?: number;
  vehicleID: string;
}

export interface ScheduleSummary {
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
  maintenanceCycleMonths?: number | null;
  vehicleID: string;
}

export interface ReminderItem {
  type: 'periodic' | 'vehicleSchedule';
  dueDate: string;
  dueStatus: DueStatus;
  nextAppointment?: NextAppointmentLite | null;
  vehicle?: { _id: string; plateNumber: string; vehicleCategory: 'CAR'|'MOTOBIKE'|'BICYCLE'; brand: string };
  user?: { _id: string; userName?: string; fullName?: string; email?: string; phoneNumber?: string };
  periodicSummary?: PeriodicSummary;
  scheduleSummary?: ScheduleSummary;
}

export interface ReminderResponse {
  success: boolean;
  data: ReminderItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  filters?: any;
}

export async function getMaintenanceReminders(params: {
  windowDays?: number;
  type?: 'periodic' | 'vehicleschedule' | 'all';
  hasAppointment?: 'true' | 'false';
  vehicleCategory?: 'CAR' | 'MOTOBIKE' | 'BICYCLE';
  include?: string;
  page?: number;
  limit?: number;
  order?: 'asc' | 'desc';
} = {}) {
  const {
    windowDays = 7,
    type = 'all',
    hasAppointment,
    vehicleCategory,
    include = 'user,vehicle',
    page = 1,
    limit = 10,
    order = 'asc',
  } = params;

  const query = new URLSearchParams();
  query.set('windowDays', String(windowDays));
  query.set('type', type);
  query.set('include', include);
  query.set('page', String(page));
  query.set('limit', String(limit));
  query.set('order', order);
  if (hasAppointment) query.set('hasAppointment', hasAppointment);
  if (vehicleCategory) query.set('vehicleCategory', vehicleCategory);

  const res = await api.get<ReminderResponse>(`/appointments/reminders/maintenance?${query.toString()}`);
  return res.data;
}

export async function sendMaintenanceReminderEmail(payload: {
  toEmail: string;
  fullName?: string;
  dueDate?: string;
  plateNumber?: string;
  vehicleBrand?: string;
  vehicleCategory?: 'CAR'|'MOTOBIKE'|'BICYCLE';
  serviceName?: string;
  remainingVisits?: number;
}) {
  const res = await api.post<{ success: boolean }>(`/appointments/reminders/maintenance/send-email`, payload);
  return res.data;
}

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

  getAppointmentByMeSorted: () => {
    // Sort by createdAt (newest first) - mới đặt lịch hiển thị đầu tiên
    return api.get<FilteredDataResponse<AppointmentResponse>>('/appointments/me?sort=createdAt&order=desc');
  },

  getAppointmentByTechnician: (
    status?: AppointmentStatus,
    opts?: {
      from?: string;
      to?: string;
      order?: 'asc' | 'desc';
      limit?: number | string;
      include?: string;
    }
  ) => {
    const params: string[] = [];
    if (status) params.push(`status=${status}`);
    if (opts?.from) params.push(`from=${encodeURIComponent(opts.from)}`);
    if (opts?.to) params.push(`to=${encodeURIComponent(opts.to)}`);
    if (opts?.order) params.push(`order=${opts.order}`);
    if (opts?.limit !== undefined) params.push(`limit=${opts.limit}`);
    params.push(`include=${encodeURIComponent(opts?.include || 'user,service,package,technicians')}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return api.get<AppointmentResponse[]>(`/appointments/technician/me${qs}`);
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
  },

  getServiceByAppointmentId: (appointmentId: string) => {
    return api.get<CheckingResponse<{
      type: 'service' | 'servicePackage';
      service?: ServiceResponse;
      servicePackage?: ServicePackageResponse;
    }>>(`/appointments/${appointmentId}/service`);
  },

  getPeriodicVehicleForUser: (userId: string, params: { serviceId?: string; servicePackageId?: string }) => {
    const q: string[] = []
    if (userId) q.push(`userId=${encodeURIComponent(userId)}`)
    if (params.serviceId) q.push(`serviceId=${encodeURIComponent(params.serviceId)}`)
    if (params.servicePackageId) q.push(`servicePackageId=${encodeURIComponent(params.servicePackageId)}`)
    const qs = q.length ? `?${q.join('&')}` : ''
    type VehicleData = {
      _id?: string;
      id?: string;
      brand?: string;
      plateNumber?: string;
      vehicleCategory?: string;
      [key: string]: unknown;
    };
    return api.get<{ success: boolean; data?: { vehicle: VehicleData; appointmentId?: string; userID: string; serviceID?: string; servicePackageID?: string } }>(`/appointments/periodic/vehicle${qs}`)
  },

  // Dashboard technician counts
  getMyTodayTotal: () => api.get<{ total: number }>('/appointments/technician/me/count/today'),
  getMyTodayConfirmed: () => api.get<{ total: number }>('/appointments/technician/me/count/today/confirmed'),
  getMyTodayInProgress: () => api.get<{ total: number }>('/appointments/technician/me/count/today/in-progress'),

  // Inventory status counts (exposed here for dashboard convenience)
  getInventoryCountByStatus: () => api.get<{ totalLowStock: number; totalInStock: number }>('/inventories/count/by-status'),
  // Dashboard overview for technician
  getTechnicianOverview: (range?: 'today' | 'week' | 'month') => {
    const qs = range ? `?range=${range}` : '';
    return api.get<TechnicianOverviewResponse>(`/dashboard/technician/overview${qs}`);
  },

  // expose maintenance reminders via object API too (optional)
  getMaintenanceReminders,
};
