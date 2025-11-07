import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';

type VehicleCategory = 'CAR' | 'MOTOBIKE' | 'BICYCLE';

const REQUIRED: Record<VehicleCategory, { leader: number; support: number }> = {
  CAR: { leader: 1, support: 2 },
  MOTOBIKE: { leader: 1, support: 1 },
  BICYCLE: { leader: 1, support: 1 }
};

function getWeekRange(date: Date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const dow = day.getDay(); // Sun=0
  const diffToMonday = (dow + 6) % 7; // Mon=0
  const start = new Date(day);
  start.setDate(day.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  end.setMilliseconds(end.getMilliseconds() - 1);
  return { start, end };
}

export async function selectTechniciansForSlot(params: {
  startTime: Date;
  endTime: Date;
  vehicleCategory: VehicleCategory;
  activeLeaders: Array<{ _id: mongoose.Types.ObjectId; startDate?: Date }>;
  activeSupports: Array<{ _id: mongoose.Types.ObjectId; startDate?: Date }>;
  overlappingAppointments: Array<{
    technicianLeaderID?: mongoose.Types.ObjectId;
    technicianSupport1ID?: mongoose.Types.ObjectId;
    technicianSupport2ID?: mongoose.Types.ObjectId;
  }>;
}) {
  const { startTime, vehicleCategory, activeLeaders, activeSupports, overlappingAppointments } = params;
  const need = REQUIRED[vehicleCategory];

  // Loại kỹ thuật viên đang bận trong slot
  const busyLeaderIds = new Set<string>();
  const busySupportIds = new Set<string>();
  overlappingAppointments.forEach(apt => {
    if (apt.technicianLeaderID) busyLeaderIds.add(String(apt.technicianLeaderID));
    if (apt.technicianSupport1ID) busySupportIds.add(String(apt.technicianSupport1ID));
    if (apt.technicianSupport2ID) busySupportIds.add(String(apt.technicianSupport2ID));
  });

  const freeLeaders = activeLeaders.filter(t => !busyLeaderIds.has(String(t._id)));
  const freeSupports = activeSupports.filter(t => !busySupportIds.has(String(t._id)));

  if (freeLeaders.length < need.leader || freeSupports.length < need.support) {
    return { ok: false as const, reason: 'not_enough_capacity', leaders: [] as string[], supports: [] as string[] };
  }

  // Tính range tuần
  const { start: weekStart, end: weekEnd } = getWeekRange(startTime);

  const leaderIds = freeLeaders.map(t => t._id);
  const supportIds = freeSupports.map(t => t._id);

  // Đếm số appointment trong tuần theo vai trò
  const weeklyCounts = await Appointment.aggregate([
    {
      $match: {
        bookingDate: { $gte: weekStart, $lte: weekEnd },
        status: { $nin: ['cancelled'] },
        $or: [
          { technicianLeaderID: { $in: leaderIds } },
          { technicianSupport1ID: { $in: supportIds } },
          { technicianSupport2ID: { $in: supportIds } }
        ]
      }
    },
    {
      $project: {
        leader: { $ifNull: ['$technicianLeaderID', null] },
        support1: { $ifNull: ['$technicianSupport1ID', null] },
        support2: { $ifNull: ['$technicianSupport2ID', null] }
      }
    },
    {
      $facet: {
        leader: [
          { $match: { leader: { $ne: null } } },
          { $group: { _id: '$leader', cnt: { $sum: 1 } } }
        ],
        support: [
          { $project: { support: ['$support1', '$support2'] } },
          { $unwind: '$support' },
          { $match: { support: { $ne: null } } },
          { $group: { _id: '$support', cnt: { $sum: 1 } } }
        ]
      }
    }
  ]);

  const leaderCountMap = new Map<string, number>();
  const supportCountMap = new Map<string, number>();
  if (weeklyCounts[0]) {
    (weeklyCounts[0].leader || []).forEach((r: any) => leaderCountMap.set(String(r._id), r.cnt));
    (weeklyCounts[0].support || []).forEach((r: any) => supportCountMap.set(String(r._id), r.cnt));
  }

  // Sắp xếp theo số job trong tuần, tie-breaker: startDate, rồi _id
  const byCountThenDate = <T extends { _id: mongoose.Types.ObjectId; startDate?: Date }>(
    getCount: (id: string) => number
  ) => (a: T, b: T) => {
    const ca = getCount(String(a._id)) || 0;
    const cb = getCount(String(b._id)) || 0;
    if (ca !== cb) return ca - cb;
    const da = a.startDate ? new Date(a.startDate).getTime() : 0;
    const db = b.startDate ? new Date(b.startDate).getTime() : 0;
    if (da !== db) return da - db;
    return String(a._id).localeCompare(String(b._id));
  };

  const sortedLeaders = [...freeLeaders].sort(byCountThenDate(id => leaderCountMap.get(id) || 0));
  const sortedSupports = [...freeSupports].sort(byCountThenDate(id => supportCountMap.get(id) || 0));

  const chosenLeaderIds: string[] = [];
  const chosenSupportIds: string[] = [];

  for (const t of sortedLeaders) {
    if (chosenLeaderIds.length >= need.leader) break;
    chosenLeaderIds.push(String(t._id));
  }

  for (const t of sortedSupports) {
    if (chosenSupportIds.length >= need.support) break;
    const id = String(t._id);
    if (!chosenLeaderIds.includes(id)) {
      chosenSupportIds.push(id);
    }
  }

  if (chosenLeaderIds.length < need.leader || chosenSupportIds.length < need.support) {
    return { ok: false as const, reason: 'not_enough_capacity', leaders: chosenLeaderIds, supports: chosenSupportIds };
  }

  return { ok: true as const, leaders: chosenLeaderIds, supports: chosenSupportIds };
}


