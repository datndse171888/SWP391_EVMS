// src/pages/admin/Appointments.tsx
import React, { useState, useEffect } from 'react';
import { AppointmentApi } from '../../api/AppointmentApi';
import AppointmentDetailModal from '../../components/ui/AppointmentDetailModal';
import type { AppointmentResponse, AppointmentStatus } from '../../types/Appoitment';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await AppointmentApi.getAllAppointments();
      const data = response.data?.data || [];
      setAppointments(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lịch hẹn:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date | null): AppointmentResponse[] => {
    if (!date) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.bookingDate).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric'
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameMonth = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  };

  const getStatusColor = (status: AppointmentStatus) => {
    const colorMap: Record<AppointmentStatus, string> = {
      'pending': 'bg-yellow-500',
      'confirmed': 'bg-blue-500',
      'in_progress': 'bg-purple-500',
      'awaiting_payment': 'bg-orange-500',
      'completed': 'bg-green-500',
      'cancelled': 'bg-red-500'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const handleAppointmentClick = (e: React.MouseEvent, appointment: AppointmentResponse) => {
    e.stopPropagation(); // Prevent date cell click
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-6 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Lịch hẹn</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả lịch hẹn trong hệ thống</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">
                {formatMonthYear(currentDate)}
              </h2>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-0 text-white rounded-lg hover:bg-azure-0 transition-colors text-sm"
              >
                Hôm nay
              </button>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azure-0"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Week day headers */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className="py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {days.map((date, index) => {
                  const dayAppointments = getAppointmentsForDate(date);
                  const isCurrentMonth = isSameMonth(date);
                  const isCurrentDay = isToday(date);

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] border-r border-b border-gray-200 last:border-r-0 p-2 ${
                        !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                      } ${isCurrentDay ? 'bg-blue-0/5' : ''} transition-colors`}
                    >
                      {date && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            !isCurrentMonth ? 'text-gray-400' : isCurrentDay ? 'text-blue-0 font-bold' : 'text-gray-700'
                          }`}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 3).map((apt) => (
                              <div
                                key={apt._id}
                                className={`group relative text-xs px-2 py-1.5 rounded ${getStatusColor(apt.status)} text-white flex items-center justify-between gap-1 hover:opacity-90 transition-opacity`}
                                title={`${new Date(apt.bookingDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${apt.status}`}
                              >
                                <span className="flex-1 truncate">
                                  {new Date(apt.bookingDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button
                                  onClick={(e) => handleAppointmentClick(e, apt)}
                                  className="flex-shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors"
                                  title="Xem chi tiết"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                            {dayAppointments.length > 3 && (
                              <div className="text-xs text-gray-500 font-medium">
                                +{dayAppointments.length - 3} khác
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Chờ xác nhận</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-sm text-gray-600">Đã xác nhận</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-sm text-gray-600">Đang tiến hành</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span className="text-sm text-gray-600">Chờ thanh toán</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-sm text-gray-600">Hoàn thành</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-sm text-gray-600">Đã hủy</span>
            </div>
          </div>
        </div>
      </main>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAppointment(null);
          }}
          varient="staff"
        />
      )}
    </div>
  );
};

export default Appointments;
