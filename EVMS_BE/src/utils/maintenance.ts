export type VehicleCategory = 'CAR' | 'BICYCLE' | 'MOTOBIKE';

export function getDefaultMaintenanceCycleMonths(category: VehicleCategory): number {
  switch (category) {
    case 'BICYCLE':
      return 3;
    case 'MOTOBIKE':
      return 6;
    case 'CAR':
    default:
      return 6;
  }
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Handle edge cases for months with fewer days
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d;
}

export function computeNextMaintenanceDate(
  lastMaintenanceDate: Date,
  cycleMonths: number
): Date {
  return addMonths(lastMaintenanceDate, cycleMonths);
}

export function isDue(date: Date | undefined | null, now: Date = new Date()): boolean {
  if (!date) return false;
  return date.getTime() <= now.getTime();
}

export type SlotStatus = 'completed' | 'overdue' | 'dueToday' | 'upcoming' | 'future';

export function daysBetween(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const aa = new Date(a); aa.setHours(0,0,0,0);
  const bb = new Date(b); bb.setHours(0,0,0,0);
  return Math.round((aa.getTime() - bb.getTime()) / ms);
}

export function buildMaintenanceTimeline(options: {
  lastMaintenanceDate?: Date | null;
  nextMaintenanceDate?: Date | null;
  cycleMonths: number;
  slotsCount?: number; // default 8
  upcomingDays?: number; // default 7
}): Array<{ date: Date; status: SlotStatus }>{
  const { lastMaintenanceDate, nextMaintenanceDate, cycleMonths, slotsCount = 8, upcomingDays = 7 } = options;
  const today = new Date(); today.setHours(0,0,0,0);

  // Determine first slot date
  let start: Date;
  if (nextMaintenanceDate) {
    // go back half of slots to include past
    start = new Date(nextMaintenanceDate);
    const back = Math.floor(slotsCount / 2);
    for (let i = 0; i < back; i++) start = addMonths(new Date(start), -cycleMonths);
  } else if (lastMaintenanceDate) {
    start = addMonths(new Date(lastMaintenanceDate), cycleMonths);
  } else {
    start = new Date(today);
  }

  const result: Array<{ date: Date; status: SlotStatus }> = [];
  for (let i = 0; i < slotsCount; i++) {
    const date = i === 0 ? start : addMonths(result[i - 1].date, cycleMonths);
    const d = new Date(date); d.setHours(0,0,0,0);
    let status: SlotStatus = 'future';
    if (lastMaintenanceDate && d.getTime() <= new Date(lastMaintenanceDate).setHours(0,0,0,0)) {
      status = 'completed';
    } else if (d.getTime() === today.getTime()) {
      status = 'dueToday';
    } else if (d.getTime() < today.getTime()) {
      status = 'overdue';
    } else if (daysBetween(d, today) <= upcomingDays) {
      status = 'upcoming';
    }
    result.push({ date: d, status });
  }
  return result;
}


