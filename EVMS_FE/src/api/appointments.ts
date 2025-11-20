import { api } from '../utils/Axios';

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

