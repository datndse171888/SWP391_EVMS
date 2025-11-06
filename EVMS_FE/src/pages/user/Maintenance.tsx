import React, { useEffect, useState } from 'react';
import { UserProfileLayout } from '../../components/layout/UserProfileLayout';
import { UserProfileSidebar } from '../../components/layout/UserProfileSidebar';
import { UserProfileHeader } from '../../components/layout/UserProfileHeader';
import { VehicleApi } from '../../api/VehicleApi';
import { ServiceApi } from '../../api/ServiceApi';
import { ServicePackageApi } from '../../api/ServicePackageApi';
import type { MaintenanceItem } from '../../types/Maintenance';
import type { VehicleResponse } from '../../types/Vehicle';
import type { ServiceResponse } from '../../types/Service';
import type { ServicePackageResponse } from '../../types/ServicePackage';
import { MaintenanceTimeline } from '../../components/MaintenanceTimeline';

export default function Maintenance() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await VehicleApi.getMyPeriodicSubscriptions();
        setSubs(res.data.items || []);
      } catch (e) {
        console.error('Load subscriptions failed', e);
      } finally { setLoading(false); }
    })();
  }, []);

  const buildTimelineFromStatus = (veh: VehicleResponse, info: any): MaintenanceItem => {
    // Build slots using startDate, intervalMonths, totalVisits
    const slots: { date: string; status: any }[] = [];
    const total = info?.totalVisits || 0;
    const used = info?.visitsUsed || 0;
    if (info?.startDate && info?.intervalMonths) {
      const start = new Date(info.startDate);
      for (let i = 0; i < total; i++) {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i * info.intervalMonths);
        let status: any = 'future';
        const today = new Date(); today.setHours(0,0,0,0);
        const dd = new Date(d); dd.setHours(0,0,0,0);
        if (i < used) status = 'completed';
        else if (dd.getTime() === today.getTime()) status = 'dueToday';
        else if (dd.getTime() < today.getTime()) status = 'overdue';
        else status = 'upcoming';
        slots.push({ date: d.toISOString(), status });
      }
    }
    const nextDueDate = info?.nextDueDate || null;
    const daysUntilDue = nextDueDate ? Math.ceil((new Date(nextDueDate).getTime() - Date.now()) / (1000*60*60*24)) : null;
    return {
      vehicleId: String(veh._id || veh.id),
      plateNumber: veh.plateNumber,
      vehicleCategory: veh.vehicleCategory as any,
      lastMaintenanceDate: null,
      nextMaintenanceDate: nextDueDate,
      maintenanceCycleMonths: info?.intervalMonths || 0,
      isMaintenanceDue: !!(daysUntilDue !== null && daysUntilDue <= 0),
      daysUntilDue,
      bookingUrl: `/appointments/new?vehicleId=${veh._id || veh.id}`,
      timeline: slots
    };
  };

  const toItem = (sub: any): MaintenanceItem => {
    const nextDueDate = sub?.nextDueDate || null;
    const daysUntilDue = nextDueDate ? Math.ceil((new Date(nextDueDate).getTime() - Date.now())/(1000*60*60*24)) : null;
    // build simple slots from startDate
    const slots: any[] = [];
    if (sub.startDate && sub.intervalMonths && sub.totalVisits) {
      const start = new Date(sub.startDate);
      for (let i=0;i<sub.totalVisits;i++) {
        const d = new Date(start); d.setMonth(d.getMonth()+ i*sub.intervalMonths);
        let status: any = 'future'; const today = new Date(); today.setHours(0,0,0,0); const dd = new Date(d); dd.setHours(0,0,0,0);
        if (i < (sub.visitsUsed||0)) status='completed'; else if (dd.getTime()===today.getTime()) status='dueToday'; else if (dd.getTime()<today.getTime()) status='overdue'; else status='upcoming';
        slots.push({ date: d.toISOString(), status });
      }
    }
    return {
      vehicleId: sub.vehicleId,
      plateNumber: sub.plateNumber,
      vehicleCategory: sub.vehicleCategory,
      lastMaintenanceDate: null,
      nextMaintenanceDate: nextDueDate,
      maintenanceCycleMonths: sub.intervalMonths,
      isMaintenanceDue: !!(daysUntilDue !== null && daysUntilDue <= 0),
      daysUntilDue,
      bookingUrl: `/appointments/new?vehicleId=${sub.vehicleId}`,
      timeline: slots
    };
  };

  return (
    <UserProfileLayout>
      <div className="flex flex-row w-full">
        <UserProfileSidebar />
        <div className="flex-1">
          <div className="w-full px-8 py-8">
            <UserProfileHeader title="Bảo dưỡng định kỳ" description="Theo dõi các mốc bảo dưỡng và đặt lịch nhanh" />

            <div className="bg-white rounded-lg shadow-lg p-8 w-full">
              {loading ? (
                <div className="text-gray-500">Đang tải...</div>
              ) : subs.length === 0 ? (
                <div className="text-gray-500">Chưa có dịch vụ/gói định kỳ nào đã được sử dụng.</div>
              ) : (
                <div className="grid" style={{ gap: 16 }}>
                  {subs.map((s:any) => (
                    <MaintenanceTimeline key={`${s.vehicleId}-${s.sourceId}`} item={toItem(s)} onBook={(url)=> (window.location.href=url)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
}


