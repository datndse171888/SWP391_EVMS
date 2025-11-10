import React, { useEffect, useMemo, useState } from 'react';
import { AppointmentApi } from '../../api/AppointmentApi';
import { DashboardApi, type TechnicianOverviewResponse } from '../../api/DashboardApi';

// CSS to hide scrollbar but keep scrolling functionality
const hideScrollbarStyles = `
  /* Chrome, Safari, Edge */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  /* Firefox */
  .hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`;

const TechnicianDashboard: React.FC = () => {
  // Derived config
  const apiBaseUrl = useMemo(() => {
    // Prefer Vite env, fallback smartly:
    // - If running at dev port (e.g., 5173), default to http://localhost:4000/api
    // - Else use same-origin /api
    const fromEnv = (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } })?.env?.VITE_API_BASE_URL;
    if (fromEnv) return fromEnv.replace(/\/+$/, '');
    if (typeof window !== 'undefined') {
      const { origin } = window.location;
      const url = new URL(origin);
      const isDevPort = ['5173', '3000', '5174'].includes(url.port);
      if (isDevPort) return 'http://localhost:4000/api';
      return `${origin}/api`;
    }
    return 'http://localhost:4000/api';
  }, []);

  // Simple auth header resolver
  const authHeaders = useMemo<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {} as Record<string, string>;
    const candidates = [
      window.localStorage.getItem('token'),
      window.localStorage.getItem('accessToken'),
      window.localStorage.getItem('access_token'),
      window.sessionStorage.getItem('token'),
      window.sessionStorage.getItem('accessToken'),
      window.sessionStorage.getItem('access_token'),
    ].filter(Boolean) as string[];
    const token = candidates[0];
    return token ? { Authorization: `Bearer ${token}` } : ({} as Record<string, string>);
  }, []);

  // Minimal type used in dashboard table
  type AppointmentLite = {
    _id?: string;
    bookingDate?: string;
    status?: string;
    reason?: string;
    userID?: { fullName?: string; userName?: string };
    serviceID?: { name?: string };
    servicePackageID?: { name?: string };
  };

  // KPI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [todayConfirmed, setTodayConfirmed] = useState<number>(0);
  const [todayInProgress, setTodayInProgress] = useState<number>(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentLite[]>([]);
  const [inventoryCounts, setInventoryCounts] = useState<{ totalLowStock: number; totalInStock: number } | null>(null);
  const [query, setQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [overview, setOverview] = useState<TechnicianOverviewResponse | null>(null);

  const nowIso = useMemo(() => new Date().toISOString(), []);

  // Tính toán 7 ngày trong tuần hiện tại
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    // Tính thứ 2 của tuần hiện tại
    const day = currentWeekStart.getDay();
    const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    currentWeekStart.setDate(diff);
    currentWeekStart.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push({
        date,
        dateString: date.toISOString().split('T')[0], // YYYY-MM-DD
        displayLabel: `${date.getDate()}/${date.getMonth() + 1}`,
        dayName: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()]
      });
    }
    return days;
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        // 1) Overview API cho stats hôm nay và inventory (không phụ thuộc weekOffset)
        const overviewRes = await DashboardApi.getTechnicianOverview('week');

        // 2) Fetch appointments trong tuần được chọn để tính performance
        const weekStart = weekDays[0].date.toISOString();
        const weekEnd = new Date(weekDays[6].date);
        weekEnd.setHours(23, 59, 59, 999);
        const weekEndIso = weekEnd.toISOString();
        
        const weekAppointmentsRes = await AppointmentApi.getAppointmentByTechnician(undefined, {
          from: weekStart,
          to: weekEndIso,
          include: 'user,service,package',
        });
        const weekAppointments = Array.isArray(weekAppointmentsRes.data) ? weekAppointmentsRes.data : [];

        // 3) Fetch next 5 upcoming (use Axios instance to ensure token from interceptor)
        const nextRes = await AppointmentApi.getAppointmentByTechnician(undefined, {
          from: nowIso,
          order: 'asc',
          limit: 5,
          include: 'user,service,package',
        });
        const nextJson = nextRes.data;

        // 4) Inventory counts from overview
        const invJson = overviewRes.data.inventory;

        // 5) Tính performance data từ appointments trong tuần
        const performanceMap = new Map<string, number>();
        weekAppointments.forEach((apt) => {
          if (apt.status === 'awaiting_payment' || apt.status === 'completed') {
            if (apt.bookingDate) {
              const date = new Date(apt.bookingDate);
              const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
              performanceMap.set(dateKey, (performanceMap.get(dateKey) || 0) + 1);
            }
          }
        });

        // Convert map to array format
        const performanceArray = Array.from(performanceMap.entries()).map(([label, completed]) => ({
          label,
          completed
        }));

        if (!isCancelled) {
          setTodayTotal(overviewRes.data.stats?.totalToday ?? 0);
          setTodayConfirmed(overviewRes.data.stats?.confirmedToday ?? 0);
          setTodayInProgress(overviewRes.data.stats?.inProgressToday ?? 0);
          setUpcomingAppointments(Array.isArray(nextJson) ? (nextJson as unknown as AppointmentLite[]) : []);
          setInventoryCounts(invJson);
          // Update overview với performance data mới
          setOverview({
            ...overviewRes.data,
            performance: performanceArray
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
        if (!isCancelled) setErrorMessage(message);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [apiBaseUrl, authHeaders, nowIso, weekDays]);

  // Compute status counts for today from fetched array
  const statusCounts = useMemo(() => {
    return {
      confirmed: todayConfirmed,
      in_progress: todayInProgress,
      totalToday: todayTotal,
    };
  }, [todayConfirmed, todayInProgress, todayTotal]);

  // Performance chart data - fill đủ 7 ngày trong tuần
  const performanceData = useMemo(() => {
    const rawData = overview?.performance || [];
    
    // Tạo map từ raw data để lookup nhanh
    const dataMap = new Map<string, number>();
    rawData.forEach(d => {
      dataMap.set(d.label, d.completed || 0);
    });
    
    // Fill đủ 7 ngày trong tuần, ngày nào không có data thì = 0
    const weekData = weekDays.map(day => {
      const completed = dataMap.get(day.dateString) || 0;
      return {
        ...day,
        completed,
        label: day.dateString,
        displayLabel: day.displayLabel
      };
    });
    
    return weekData;
  }, [overview, weekDays]);
  
  const maxPerf = Math.max(1, ...(performanceData.map(d => d.completed || 0)));

  // Inject CSS for hiding scrollbar
  if (typeof document !== 'undefined' && !document.getElementById('hide-scrollbar-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'hide-scrollbar-styles';
    styleSheet.textContent = hideScrollbarStyles;
    document.head.appendChild(styleSheet);
  }

  return (
    <div className="h-full bg-gray-50 p- hide-scrollbar" style={{ overflow: 'auto' }}>
      <div className="flex flex-col space-y-4">

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          {/* Tổng lịch hôm nay (của tôi) */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#5f6777' }}>Tổng lịch hôm nay</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#014091' }}>{statusCounts.totalToday.toLocaleString()}</p>
                <p className="text-xs mt-1" style={{ color: '#5f6777' }}>{isLoading ? 'Đang tải...' : 'Cập nhật theo thời gian thực'}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8dcdfa' }}>
                <svg className="w-5 h-5" style={{ color: '#014091' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Confirmed hôm nay */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#5f6777' }}>Confirmed hôm nay</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#014091' }}>{statusCounts.confirmed}</p>
                <p className="text-xs mt-1" style={{ color: '#5f6777' }}>include: khách, dịch vụ</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8dcdfa' }}>
                <svg className="w-5 h-5" style={{ color: '#014091' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* In Progress hôm nay */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#5f6777' }}>In progress hôm nay</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#014091' }}>{statusCounts.in_progress}</p>
                <p className="text-xs mt-1" style={{ color: '#5f6777' }}>Cập nhật trực tiếp</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8dcdfa' }}>
                <svg className="w-5 h-5" style={{ color: '#014091' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 6a9 9 0 110 12 9 9 0 010-12z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Low stock (tồn kho cảnh báo) */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#5f6777' }}>Low stock</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#014091' }}>
                  {inventoryCounts ? inventoryCounts.totalLowStock : (isLoading ? '...' : '0')}
                </p>
                <p className="text-xs mt-1" style={{ color: '#5f6777' }}>In stock: {inventoryCounts ? inventoryCounts.totalInStock : (isLoading ? '...' : '0')}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8dcdfa' }}>
                <svg className="w-5 h-5" style={{ color: '#014091' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: '240px' }}>
          {/* Tổng quan hiệu suất */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold" style={{ color: '#014091' }}>Tổng quan hiệu suất</h2>
              <span className="text-xs text-gray-600">Tuần này</span>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-1" style={{ height: '150px', minHeight: '150px' }}>
              {performanceData.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Chưa có dữ liệu</div>
              )}
              {performanceData.length > 0 && performanceData.map((data, index) => {
                const completed = data.completed || 0;
                // Tính tỷ lệ chiều cao: ngày có nhiều appointment thì cột cao, ít thì thấp
                const height = maxPerf > 0 ? Math.max((completed / maxPerf) * 100, completed > 0 ? 8 : 0) : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end group" style={{ minWidth: '35px' }}>
                    <div
                      className="w-full rounded-t transition-all cursor-pointer relative bg-blue-500 hover:bg-blue-600"
                      style={{ 
                        height: `${height}%`,
                        minHeight: completed > 0 ? '8px' : '0px'
                      }}
                      title={`${data.dayName} ${data.displayLabel}: ${completed} lịch`}
                    >
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        <div className="font-medium">{data.dayName} {data.displayLabel}</div>
                        <div className="text-xs mt-0.5">
                          {completed} lịch hoàn thành
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium text-gray-700">{data.dayName}</div>
                      <div className="text-xs text-gray-500" style={{ fontSize: '10px' }}>{data.displayLabel}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tiến độ công việc (mô phỏng) */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold" style={{ color: '#014091' }}>Tiến độ công việc</h2>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            {/* Progress Gauge - Hiển thị tỷ lệ completed / pending (checklist) */}
            <div className="flex-1 flex flex-col items-center justify-center" style={{ height: '120px' }}>
              <div className="relative w-16 h-16">
                {/* Background circle */}
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - ((overview?.progress?.gaugeProgressRate || 0) / 100))}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold" style={{ color: '#014091' }}>
                    {(overview?.progress?.gaugeProgressRate || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <span className="text-xs mt-2" style={{ color: '#5f6777' }}>Tiến độ</span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-center">
                <div className="text-base font-bold" style={{ color: '#014091' }}>
                  {overview?.progress?.leftTotal ?? 0}
                </div>
                <div className="text-xs" style={{ color: '#5f6777' }}>Lịch đã nhận</div>
                <div className="text-xs px-1 py-0.5 rounded-full inline-block mt-1" style={{ color: '#f6ae2d', backgroundColor: '#fad38e' }}>
                  {(overview?.progress?.leftPercent || 0).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold" style={{ color: '#014091' }}>
                  {overview?.progress?.rightTotal ?? 0}
                </div>
                <div className="text-xs" style={{ color: '#5f6777' }}>Task đang làm</div>
                <div className="text-xs px-1 py-0.5 rounded-full inline-block mt-1" style={{ color: '#5f6777', backgroundColor: '#8dcdfa' }}>
                  {(overview?.progress?.rightPercent || 0).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lịch sắp tới (Next confirmed & in_progress) */}
        <div className="bg-white rounded-lg shadow-sm flex flex-col flex-shrink-0" style={{ height: '240px' }}>
          <div className="p-2 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold" style={{ color: '#014091' }}>Lịch sắp tới</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm khách hàng..."
                    className="pl-8 pr-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <svg className="w-3 h-3 text-gray-400 absolute left-2 top-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="confirmed">confirmed</option>
                  <option value="in_progress">in_progress</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments
                  .filter((apt) => {
                    const customerName = (apt?.userID?.fullName || apt?.userID?.userName || '').toLowerCase();
                    const q = query.trim().toLowerCase();
                    const byName = q ? customerName.includes(q) : true;
                    const status = apt?.status || '';
                    const isRelevant = status === 'confirmed' || status === 'in_progress';
                    const byStatus = statusFilter === 'all' ? true : status === statusFilter;
                    return byName && isRelevant && byStatus;
                  })
                  .map((apt, idx) => {
                  const booking = apt?.bookingDate ? new Date(apt.bookingDate) : null;
                  const timeStr = booking ? booking.toLocaleString() : '-';
                  const customer = apt?.userID?.fullName || apt?.userID?.userName || 'Khách';
                  const label = apt?.serviceID?.name || apt?.servicePackageID?.name || 'Dịch vụ';
                  const status = apt?.status || 'pending';
                  const statusStyle =
                    status === 'in_progress'
                      ? { backgroundColor: '#8dcdfa', color: '#014091' }
                      : status === 'completed'
                      ? { backgroundColor: '#d1fae5', color: '#065f46' }
                      : { backgroundColor: '#fad38e', color: '#f6ae2d' };
                  return (
                    <tr key={apt?._id || idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                            </svg>
                          </div>
                          <div className="ml-2">
                            <div className="text-xs font-medium" style={{ color: '#014091' }}>{label}</div>
                            <div className="text-xs" style={{ color: '#5f6777' }}>
                              {apt?.reason && apt.reason.trim().length > 0 ? apt.reason : 'Không có ghi chú'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs" style={{ color: '#014091' }}>{timeStr}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs" style={{ color: '#014091' }}>{customer}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={statusStyle}>
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {upcomingAppointments.filter((apt) => {
                  const customerName = (apt?.userID?.fullName || apt?.userID?.userName || '').toLowerCase();
                  const q = query.trim().toLowerCase();
                  const byName = q ? customerName.includes(q) : true;
                  const status = apt?.status || '';
                  const isRelevant = status === 'confirmed' || status === 'in_progress';
                  const byStatus = statusFilter === 'all' ? true : status === statusFilter;
                  return byName && isRelevant && byStatus;
                }).length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-xs text-gray-500">Không có lịch sắp tới</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {errorMessage && (
          <div className="text-xs text-red-600 px-2">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;