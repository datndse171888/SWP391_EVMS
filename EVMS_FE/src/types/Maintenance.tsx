export type SlotStatus = 'completed' | 'overdue' | 'dueToday' | 'upcoming' | 'future';

export interface MaintenanceTimelineSlot {
  date: string; // ISO
  status: SlotStatus;
}

export interface MaintenanceItem {
  vehicleId: string;
  plateNumber: string;
  vehicleCategory: 'CAR' | 'MOTOBIKE' | 'BICYCLE';
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  maintenanceCycleMonths: number;
  isMaintenanceDue: boolean;
  daysUntilDue: number | null;
  bookingUrl: string;
  timeline: MaintenanceTimelineSlot[];
}

export interface MaintenanceMyResponse {
  items: MaintenanceItem[];
  count: number;
}


