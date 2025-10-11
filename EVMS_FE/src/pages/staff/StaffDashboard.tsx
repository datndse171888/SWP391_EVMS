import React from 'react';
import { Link } from 'react-router-dom';

const StaffDashboard: React.FC = () => {
  // Mock data - sẽ được thay thế bằng API calls
  const stats = {
    inventory: {
      totalParts: 156,
      lowStock: 8,
      recentlyAdded: 12
    },
    customers: {
      totalCustomers: 89,
      activeToday: 15,
      unreadMessages: 3
    },
    appointments: {
      today: 8,
      upcoming: 24,
      confirmed: 18,
      cancelled: 2
    }
  };

  const recentActivities = [
    { id: 1, type: 'appointment', message: 'Lịch hẹn mới từ Nguyễn Văn A', time: '10 phút trước' },
    { id: 2, type: 'inventory', message: 'Phụ tùng "Lốp xe" sắp hết hàng', time: '1 giờ trước' },
    { id: 3, type: 'customer', message: 'Tin nhắn mới từ Trần Thị B', time: '2 giờ trước' },
    { id: 4, type: 'appointment', message: 'Xác nhận lịch hẹn cho Lê Văn C', time: '3 giờ trước' }
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h1 className="text-lg font-bold text-gray-900">
          Chào mừng trở lại!
        </h1>
        <p className="text-xs text-gray-600">
          Tổng quan hoạt động hôm nay
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Inventory Stats */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng phụ tùng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inventory.totalParts}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#8dcdfa' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 font-medium">{stats.inventory.lowStock} sắp hết</span>
            <span className="text-gray-500 ml-2">• {stats.inventory.recentlyAdded} mới thêm</span>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Khách hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.customers.totalCustomers}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#8abdfe' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">{stats.customers.activeToday} hoạt động hôm nay</span>
            {stats.customers.unreadMessages > 0 && (
              <span className="text-red-600 ml-2">• {stats.customers.unreadMessages} tin nhắn mới</span>
            )}
          </div>
        </div>

        {/* Appointment Stats */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lịch hẹn hôm nay</p>
              <p className="text-2xl font-bold text-gray-900">{stats.appointments.today}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#0991f3' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">{stats.appointments.confirmed} đã xác nhận</span>
            <span className="text-gray-500 ml-2">• {stats.appointments.cancelled} đã hủy</span>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sắp tới</p>
              <p className="text-2xl font-bold text-gray-900">{stats.appointments.upcoming}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: '#f6ae2d' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-orange-600 font-medium">Lịch hẹn sắp tới</span>
            <span className="text-gray-500 ml-2">• Cần xác nhận</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link
            to="/staff/customers"
            className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 rounded-full mb-2" style={{ backgroundColor: '#8dcdfa' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Quản lý khách hàng</span>
          </Link>

          <Link
            to="/staff/services"
            className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 rounded-full mb-2" style={{ backgroundColor: '#8abdfe' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Quản lý dịch vụ</span>
          </Link>

          <Link
            to="/staff/appointments"
            className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 rounded-full mb-2" style={{ backgroundColor: '#0991f3' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Lịch hẹn</span>
          </Link>

          <Link
            to="/staff/profile"
            className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 rounded-full mb-2" style={{ backgroundColor: '#f6ae2d' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#014091' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Hồ sơ cá nhân</span>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Hoạt động gần đây</h2>
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
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
