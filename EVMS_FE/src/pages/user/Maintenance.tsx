import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppointmentApi } from '../../api/AppointmentApi';
import { useAlert } from '../../hooks/useAlert';
import { UserProfileLayout } from '../../components/layout/UserProfileLayout';
import { UserProfileSidebar } from '../../components/layout/UserProfileSidebar';
import { UserProfileHeader } from '../../components/layout/UserProfileHeader';
import { VehicleApi } from '../../api/VehicleApi';
import type { MaintenanceItem, SlotStatus } from '../../types/Maintenance';
import { MaintenanceTimeline } from '../../components/MaintenanceTimeline';

type PeriodicSubscription = {
  vehicleId: string;
  plateNumber: string;
  vehicleCategory: 'CAR' | 'MOTOBIKE' | 'BICYCLE';
  sourceType?: 'service' | 'package' | 'servicePackage';
  sourceId?: string;
  serviceId?: string;
  servicePackageId?: string;
  startDate?: string;
  visitsUsed?: number;
  totalVisits?: number;
  intervalMonths?: number;
  nextDueDate?: string;
};

export default function Maintenance() {
  const { showAlert } = useAlert();
  const [subs, setSubs] = useState<PeriodicSubscription[]>([]);
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


  const toItem = (sub: PeriodicSubscription): MaintenanceItem => {
    const nextDueDate = sub?.nextDueDate || null;
    const daysUntilDue = nextDueDate ? Math.ceil((new Date(nextDueDate).getTime() - Date.now())/(1000*60*60*24)) : null;
    // build simple slots from startDate
    const slots: { date: string; status: SlotStatus }[] = [];
    if (sub.startDate && sub.intervalMonths && sub.totalVisits) {
      const start = new Date(sub.startDate);
      for (let i=0;i<sub.totalVisits;i++) {
        const d = new Date(start); d.setMonth(d.getMonth()+ i*sub.intervalMonths);
        let status: SlotStatus = 'future'; 
        const today = new Date(); today.setHours(0,0,0,0); 
        const dd = new Date(d); dd.setHours(0,0,0,0);
        if (i < (sub.visitsUsed||0)) status='completed'; 
        else if (dd.getTime()===today.getTime()) status='dueToday'; 
        else if (dd.getTime()<today.getTime()) status='overdue'; 
        else status='upcoming';
        slots.push({ date: d.toISOString(), status });
      }
    }
    return {
      vehicleId: sub.vehicleId,
      plateNumber: sub.plateNumber,
      vehicleCategory: sub.vehicleCategory,
      lastMaintenanceDate: null,
      nextMaintenanceDate: nextDueDate,
      maintenanceCycleMonths: sub.intervalMonths || 0,
      isMaintenanceDue: !!(daysUntilDue !== null && daysUntilDue <= 0),
      daysUntilDue,
      bookingUrl: `/appointments/new?vehicleId=${sub.vehicleId}`,
      timeline: slots
    };
  };

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookDue = async (sub: PeriodicSubscription) => {
    try {
      if (!user?.id) return;
      const params: { serviceId?: string; servicePackageId?: string } = {};
      // Chuẩn hóa từ subscription item: sourceType ('service' | 'package') + sourceId
      if (sub?.sourceType === 'service' && sub?.sourceId) {
        params.serviceId = String(sub.sourceId);
      } else if ((sub?.sourceType === 'package' || sub?.sourceType === 'servicePackage') && sub?.sourceId) {
        params.servicePackageId = String(sub.sourceId);
      } else if (sub?.serviceId || sub?.servicePackageId) {
        if (sub.serviceId) params.serviceId = String(sub.serviceId);
        if (sub.servicePackageId) params.servicePackageId = String(sub.servicePackageId);
      }

      const res = await AppointmentApi.getPeriodicVehicleForUser(user.id, params);
      const data = res.data?.data;
      if (!data?.vehicle?._id) {
        showAlert('error', 'Không tìm thấy thông tin xe cho lần đặt định kỳ này');
        return;
      }
      const q: string[] = [
        `vehicleId=${encodeURIComponent(String(data.vehicle._id))}`,
        'lockService=1',
        'lockVehicle=1',
        'periodic=1'
      ];
      if (params.serviceId) q.push(`serviceId=${encodeURIComponent(params.serviceId)}`);
      if (params.servicePackageId) q.push(`servicePackageId=${encodeURIComponent(params.servicePackageId)}`);
      navigate(`/booking?${q.join('&')}`);
    } catch (e) {
      console.error('handleBookDue error:', e);
      alert('Không thể chuẩn bị đặt lịch tái kiểm tra');
    }
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
                  {subs.map((s) => (
                    <MaintenanceTimeline key={`${s.vehicleId}-${s.sourceId}`} item={toItem(s)} onBook={() => handleBookDue(s)} />
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


