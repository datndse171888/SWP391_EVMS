import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale
);
const StaffDashboard: React.FC = () => {
  // Mock data - sẽ được thay thế bằng API calls
  // Mock data - sẽ được thay thế bằng API calls
  const stats = {
    inventory: {
      totalParts: 156,
      lowStock: 8,
      recentlyAdded: 12,
      inStock: 120,
      reserved: 28,
    },
    customers: {
      totalCustomers: 89,
      activeToday: 15,
      unreadMessages: 3,
    },
    appointments: {
      today: 8,
      upcoming: 24,
      confirmed: 18,
      cancelled: 2,
    }
  };

  const recentActivities = [
    { id: 1, type: 'appointment', message: 'Lịch hẹn mới từ Nguyễn Văn A', time: '10 phút trước' },
    { id: 2, type: 'inventory', message: 'Phụ tùng "Lốp xe" sắp hết hàng', time: '1 giờ trước' },
    { id: 3, type: 'customer', message: 'Tin nhắn mới từ Trần Thị B', time: '2 giờ trước' },
    { id: 4, type: 'appointment', message: 'Xác nhận lịch hẹn cho Lê Văn C', time: '3 giờ trước' }
  ];

  // --- Chart datasets (mock) ---
  const inventoryDoughnut = useMemo(() => ({
    labels: ['Hàng có sẵn', 'Hàng sắp hết', 'Đã đặt trước'],
    datasets: [{
      data: [stats.inventory.inStock, stats.inventory.lowStock, stats.inventory.reserved],
      backgroundColor: ['#10b981', '#f59e0b', '#f97316'],
      hoverOffset: 6,
    }]
  }), [stats.inventory]);

  const appointmentsBar = useMemo(() => ({
    labels: ['Hôm nay', 'Sắp tới', 'Đã xác nhận', 'Đã hủy'],
    datasets: [{
      label: 'Số lượng',
      data: [stats.appointments.today, stats.appointments.upcoming, stats.appointments.confirmed, stats.appointments.cancelled],
      backgroundColor: ['#3b82f6', '#06b6d4', '#10b981', '#ef4444'],
    }]
  }), [stats.appointments]);

  // customers line (last 7 days mock)
  const customersLine = useMemo(() => {
    const labels = ['7d', '6d', '5d', '4d', '3d', '2d', 'Hôm nay'];
    const values = [5, 8, 7, 10, 12, 11, stats.customers.activeToday];
    return {
      labels,
      datasets: [
        {
          label: 'Khách hoạt động (7 ngày)',
          data: values,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.08)',
          tension: 0.3,
          fill: true,
          pointRadius: 3,
        }
      ]
    };
  }, [stats.customers]);

  // Chart options (simple)
  const commonOptions = { responsive: true, plugins: { legend: { display: false } } };


  return (
    <div className="h-screen overflow-y-auto">
      <div className="space-y-4 p-6 ">
        {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h1 className="text-lg font-bold text-[#014091]">Chào mừng trở lại!</h1>
        <p className="text-xs text-[#5f6777]">Tổng quan hoạt động hôm nay</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Inventory Stats */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#5f6777]">Tổng phụ tùng</p>
              <p className="text-2xl font-bold text-[#014091]">{stats.inventory.totalParts}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#8dcdfa' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium text-[#fd8c40]">{stats.inventory.lowStock} sắp hết</span>
            <span className="ml-2 text-[#5f6777]">• {stats.inventory.recentlyAdded} mới thêm</span>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#5f6777]">Khách hàng</p>
              <p className="text-2xl font-bold text-[#014091]">{stats.customers.totalCustomers}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#8abdfe' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium text-[#0991f3]">{stats.customers.activeToday} hoạt động hôm nay</span>
            {stats.customers.unreadMessages > 0 && <span className="ml-2 text-[#fd8c40]">• {stats.customers.unreadMessages} tin nhắn mới</span>}
          </div>
        </div>

        {/* Appointment Stats */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#5f6777]">Lịch hẹn hôm nay</p>
              <p className="text-2xl font-bold text-[#014091]">{stats.appointments.today}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#0991f3' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium text-[#16a34a]">{stats.appointments.confirmed} đã xác nhận</span>
            <span className="ml-2 text-[#5f6777]">• {stats.appointments.cancelled} đã hủy</span>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#5f6777]">Sắp tới</p>
              <p className="text-2xl font-bold text-[#014091]">{stats.appointments.upcoming}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#f6ae2d' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium text-[#fd8c40]">Lịch hẹn sắp tới</span>
            <span className="ml-2 text-[#5f6777]">• Cần xác nhận</span>
          </div>
        </div>
      </div>

      {/* Charts section */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">


        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-semibold mb-10">Lịch hẹn / Trạng thái</h3>
          <div style={{ height: 280 }}>
            <Bar data={appointmentsBar}
              options={{
                ...commonOptions,
                plugins: { legend: { display: false } }
              }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Tình trạng phụ tùng</h3>
          <div className="flex items-center justify-center" style={{ height: 320 }}>
            <div className="w-80 h-80">
              <Doughnut
                data={inventoryDoughnut}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-semibold mb-10">Hoạt động khách hàng (7 ngày)</h3>
          <div style={{ height: 220 }}>
            <Line data={customersLine}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h2 className="text-base font-semibold mb-2 text-[#014091]">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link to="/staff/customers" className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-3 rounded-full mb-2" style={{ backgroundColor: '#8dcdfa' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#5f6777]">Quản lý trò chuyện</span>
          </Link>

          <Link to="/staff/parts" className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-3 rounded-full mb-2" style={{ backgroundColor: '#8abdfe' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#5f6777]">Quản lý linh kiện</span>
          </Link>

          <Link to="/staff/appointments" className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-3 rounded-full mb-2" style={{ backgroundColor: '#0991f3' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#5f6777]">Lịch hẹn</span>
          </Link>

          <Link to="/staff/profile" className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-3 rounded-full mb-2" style={{ backgroundColor: '#f6ae2d' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#5f6777]">Hồ sơ cá nhân</span>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h2 className="text-base font-semibold mb-2 text-[#014091]">Hoạt động gần đây</h2>
        <div className="space-y-1">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center p-1.5 border border-gray-100 rounded-lg">
              <div className="p-2 rounded-full mr-3" style={{
                backgroundColor: activity.type === 'appointment' ? '#0991f3' :
                  activity.type === 'inventory' ? '#8dcdfa' :
                    '#8abdfe'
              }}>
                {activity.type === 'appointment' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {activity.type === 'inventory' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
                {activity.type === 'customer' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#014091]">{activity.message}</p>
                <p className="text-xs text-[#5f6777]">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default StaffDashboard;
