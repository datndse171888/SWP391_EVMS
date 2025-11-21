import React, { useEffect, useMemo, useState } from 'react';
import { getMaintenanceReminders, sendMaintenanceReminderEmail, type ReminderItem, type ReminderType } from '../../api/AppointmentApi';

type HasAppointmentOption = 'all' | 'true' | 'false';

type VehicleCategory = 'CAR' | 'MOTOBIKE' | 'BICYCLE' | 'all';

const badgeColorByDue: Record<string, string> = {
  overdue: 'bg-red-100 text-red-700 border-red-200',
  dueToday: 'bg-amber-100 text-amber-800 border-amber-200',
  upcoming: 'bg-green-100 text-green-700 border-green-200',
};

function formatDate(dt?: string | Date | null) {
  if (!dt) return '-';
  const d = typeof dt === 'string' ? new Date(dt) : dt;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

export default function MaintenanceReminders() {
  const [items, setItems] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [windowDays, setWindowDays] = useState(7);
  const [type, setType] = useState<ReminderType>('all');
  const [hasAppointment, setHasAppointment] = useState<HasAppointmentOption>('all');
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('all');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Email sending state
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);

  async function handleSendEmail(it: ReminderItem, idx: number) {
    if (!it.user?.email) return;
    setSendingIndex(idx);
    try {
      await sendMaintenanceReminderEmail({
        toEmail: it.user.email,
        fullName: it.user.fullName || it.user.userName,
        dueDate: it.dueDate,
        plateNumber: it.vehicle?.plateNumber,
        vehicleBrand: it.vehicle?.brand,
        vehicleCategory: it.vehicle?.vehicleCategory as any,
        serviceName: it.periodicSummary?.serviceName,
        remainingVisits: it.periodicSummary?.remainingVisits,
      });
      alert('Đã gửi email nhắc hẹn');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Gửi email thất bại');
    } finally {
      setSendingIndex(null);
    }
  }

  const queryParams = useMemo(() => ({ windowDays, type, hasAppointment, vehicleCategory, page, limit, order }), [windowDays, type, hasAppointment, vehicleCategory, page, limit, order]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await getMaintenanceReminders({
        windowDays: queryParams.windowDays,
        type: queryParams.type,
        hasAppointment: queryParams.hasAppointment === 'all' ? undefined : queryParams.hasAppointment,
        vehicleCategory: queryParams.vehicleCategory === 'all' ? undefined : queryParams.vehicleCategory,
        include: 'user,vehicle',
        page: queryParams.page,
        limit: queryParams.limit,
        order: queryParams.order,
      });
      setItems(res.data || []);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handleApplyFilters = () => {
    setPage(1);
    loadData();
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-xl font-semibold mb-3">Nhắc hẹn bảo dưỡng</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-sm text-gray-600">Khoảng ngày</label>
            <select className="mt-1 w-full border rounded px-2 py-2" value={windowDays} onChange={(e) => setWindowDays(parseInt(e.target.value, 10))}>
              <option value={3}>3 ngày</option>
              <option value={7}>7 ngày</option>
              <option value={14}>14 ngày</option>
              <option value={30}>30 ngày</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Loại</label>
            <select className="mt-1 w-full border rounded px-2 py-2" value={type} onChange={(e) => setType(e.target.value as ReminderType)}>
              <option value="all">Tất cả</option>
              <option value="periodic">Định kỳ</option>
              <option value="vehicleschedule">Theo lịch xe</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Có lịch sắp tới</label>
            <select className="mt-1 w-full border rounded px-2 py-2" value={hasAppointment} onChange={(e) => setHasAppointment(e.target.value as HasAppointmentOption)}>
              <option value="all">Tất cả</option>
              <option value="true">Chỉ có</option>
              <option value="false">Chưa có</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Loại xe</label>
            <select className="mt-1 w-full border rounded px-2 py-2" value={vehicleCategory} onChange={(e) => setVehicleCategory(e.target.value as VehicleCategory)}>
              <option value="all">Tất cả</option>
              <option value="CAR">CAR</option>
              <option value="MOTOBIKE">MOTOBIKE</option>
              <option value="BICYCLE">BICYCLE</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Sắp xếp</label>
            <select className="mt-1 w-full border rounded px-2 py-2" value={order} onChange={(e) => setOrder(e.target.value as 'asc'|'desc')}>
              <option value="asc">Ngày đến hạn tăng dần</option>
              <option value="desc">Ngày đến hạn giảm dần</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Số dòng/trang</label>
            <select className="mt-1 w-full border rounded px-2 py-2" value={limit} onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={handleApplyFilters} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Áp dụng</button>
          {loading && <span className="text-sm text-gray-500 self-center">Đang tải...</span>}
          {error && <span className="text-sm text-red-600 self-center">{error}</span>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Đến hạn</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Trạng thái</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Loại</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Xe</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Khách hàng</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Tóm tắt</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Lịch sắp tới</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-8">Không có nhắc hẹn trong khoảng thời gian đã chọn</td>
                </tr>
              )}
              {items.map((it, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(it.dueDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeColorByDue[it.dueStatus] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {it.dueStatus === 'overdue' ? 'Quá hạn' : it.dueStatus === 'dueToday' ? 'Hôm nay' : 'Sắp tới'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                      {it.type === 'periodic' ? 'Định kỳ' : 'Theo lịch xe'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {it.vehicle ? (
                      <div>
                        <div className="font-medium">{it.vehicle.plateNumber}</div>
                        <div className="text-xs text-gray-500">{it.vehicle.brand} • {it.vehicle.vehicleCategory}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {it.user ? (
                      <div>
                        <div className="font-medium">{it.user.fullName || it.user.userName || '-'}</div>
                        {it.user.phoneNumber ? (
                          <div className="text-sm text-gray-900 font-semibold">SĐT: {it.user.phoneNumber}</div>
                        ) : (
                          <div className="text-xs text-gray-500">{it.user.email || ''}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {it.type === 'periodic' && it.periodicSummary ? (
                      <div className="text-sm">
                        <div className="font-medium">{it.periodicSummary.serviceName || it.periodicSummary.serviceId}</div>
                        <div className="text-xs text-gray-500">{it.periodicSummary.completedVisits ?? '-'} / {it.periodicSummary.totalVisits ?? '-'} lần • Còn: {it.periodicSummary.remainingVisits ?? '-'}</div>
                        {typeof it.periodicSummary.intervalMonths === 'number' && (
                          <div className="text-xs text-gray-500">Chu kỳ: {it.periodicSummary.intervalMonths} tháng</div>
                        )}
                      </div>
                    ) : it.scheduleSummary ? (
                      <div className="text-sm">
                        <div className="text-xs text-gray-500">Lần trước: {formatDate(it.scheduleSummary.lastMaintenanceDate || null)}</div>
                        <div className="text-xs text-gray-500">Kỳ tới: {formatDate(it.scheduleSummary.nextMaintenanceDate || null)}</div>
                        {typeof it.scheduleSummary.maintenanceCycleMonths === 'number' && (
                          <div className="text-xs text-gray-500">Chu kỳ: {it.scheduleSummary.maintenanceCycleMonths} tháng</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {it.nextAppointment ? (
                      <div className="text-sm">
                        <div className="font-medium">{formatDate(it.nextAppointment.bookingDate)}</div>
                        <div className="text-xs text-gray-500">Trạng thái: {it.nextAppointment.status}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-600">Tổng: {total}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Trước
            </button>
            <span className="text-sm">Trang {page}/{totalPages}</span>
            <button
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

