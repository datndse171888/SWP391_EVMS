import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppointmentResponse, AppointmentStatus } from '../../types/Appoitment';
import { AppointmentApi } from '../../api/AppointmentApi';


type Shift = 'all' | 'morning' | 'afternoon';

// Days of week
const daysOfWeek = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
const currentDate = new Date();

// Helper: Generate week data
const generateWeekData = (startOffset = 0) => {
  const result = [];
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() + startOffset * 7);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() - startDate.getDay() + i + 1);

    result.push({
      dayName: daysOfWeek[i],
      date: date,
      dateString: `${date.getDate()}/${date.getMonth() + 1}`,
    });
  }

  return result;
};

const weekData = [
  { weekName: "Tuần này", days: generateWeekData(0) },
  { weekName: "Tuần sau", days: generateWeekData(1) },
  { weekName: "Tuần sau nữa", days: generateWeekData(2) },
  { weekName: "Tuần sau nữa nữa", days: generateWeekData(3) }
];

const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

const shiftOptions = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Ca sáng', value: 'morning' },
  { label: 'Ca chiều', value: 'afternoon' }
];

const TechnicianSchedule: React.FC = () => {

  // ===============================
  // States & Variables
  // ===============================

  const [weekIndex, setWeekIndex] = useState(0);
  const navigate = useNavigate();
  const [shift, setShift] = useState<Shift>('all');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'all'>('all');
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  // ===============================
  // useEffect 
  // ===============================

  useEffect(() => {
    fetchAppointments();
  }, []);

  // fetch function
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await AppointmentApi.getAppointmentByTechnician();
      const data: AppointmentResponse[] = response.data;
      setAppointments(data);
    } catch (error) {
      console.log('Lỗi khi fetch data: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Get appointment start time
  const getAppointmentStartTime = (app: AppointmentResponse) => {
    if (app.bookingDate) return new Date(app.bookingDate);
    return null;
  };

  // Handle appointment click
  const handleAppointmentClick = (appointmentId: string) => {
    navigate(`/technician/appointments/${appointmentId}`);
  };

  return (
    <div className="space-y-3">
      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap items-center gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus | 'all')}
          className="w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="in_progress">Đang thực hiện</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
          <option value="no_show">Không đến</option>
        </select>

        <div className="flex-1"></div>
        <div className="flex gap-1">
          {shiftOptions.map(opt => (
            <button
              key={opt.value}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 ${shift === opt.value ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              style={{ color: shift === opt.value ? '#3b82f6' : '#014091' }}
              onClick={() => setShift(opt.value as Shift)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center px-6 pt-4 pb-2 justify-between">
          <div>
            <span className="font-semibold" style={{ color: '#014091' }}>
              {weekData[weekIndex].weekName}
            </span>
            <span className="ml-2 text-gray-400 text-sm">
              ({weekData[weekIndex].days[0].dateString} - {weekData[weekIndex].days[6].dateString})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekIndex(weekIndex === 0 ? 3 : weekIndex - 1)}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={weekIndex === 0}
            >
              <ChevronLeft size={22} className={weekIndex === 0 ? 'text-gray-300' : ''} style={{ color: weekIndex === 0 ? '' : '#014091' }} />
            </button>
            <span className="text-sm text-gray-500 px-2">
              {weekIndex + 1}/4
            </span>
            <button
              onClick={() => setWeekIndex(weekIndex === 3 ? 0 : weekIndex + 1)}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={weekIndex === 3}
            >
              <ChevronRight size={22} className={weekIndex === 3 ? 'text-gray-300' : ''} style={{ color: weekIndex === 3 ? '' : '#014091' }} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-gray-100 max-h-[calc(100vh-300px)] overflow-y-auto">
          {weekData[weekIndex].days.map((day, idx) => {
            // Filter time slots by shift
            let filteredTimeSlots = timeSlots;
            if (shift === 'morning') filteredTimeSlots = ["08:00", "09:00", "10:00", "11:00"];
            else if (shift === 'afternoon') filteredTimeSlots = ["13:00", "14:00", "15:00", "16:00", "17:00"];

            // Get appointments for this day
            const daySlots = filteredTimeSlots.map(slot => {
              const appointment = appointments.find(app => {
                const appDate = getAppointmentStartTime(app);
                if (!appDate) return false;
                return (
                  appDate.getFullYear() === day.date.getFullYear() &&
                  appDate.getMonth() === day.date.getMonth() &&
                  appDate.getDate() === day.date.getDate() &&
                  appDate.getHours() === parseInt(slot)
                );
              });
              return { slot, appointment };
            });

            // Filter by status
            let filteredSlots = daySlots;
            if (selectedStatus !== 'all') {
              filteredSlots = daySlots.filter(s => s.appointment && s.appointment.status === selectedStatus);
            }

            return (
              <div key={idx} className="border-r border-gray-100 last:border-r-0 px-2 py-1">
                <div className="text-center mb-1">
                  <div className="font-medium text-sm" style={{ color: '#014091' }}>{day.dayName}</div>
                  <div className="text-xs text-gray-400">{day.dateString}</div>
                </div>
                <div className="flex flex-col gap-3">
                  {filteredSlots.length === 0 ? (
                    <div className="rounded-xl p-3 bg-gray-50 text-gray-400 text-center flex items-center justify-center border border-dashed border-gray-200 min-h-[60px]">
                      Không có lịch
                    </div>
                  ) : (
                    filteredSlots.map(({ slot, appointment }, slotIdx) => {
                      if (appointment) {
                        const date = getAppointmentStartTime(appointment);
                        if (!date) return null;
                        const endDate = new Date(date.getTime() + 60 * 60 * 1000);
                        const hour = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
                        const customerName = appointment.userID || 'Không rõ tên';

                        // Get status color class
                        const statusBgClass =
                          appointment.status === 'completed' ? 'bg-green-50' :
                            appointment.status === 'confirmed' ? 'bg-blue-50' :
                              appointment.status === 'pending' ? 'bg-yellow-50' :
                                appointment.status === 'in_progress' ? 'bg-purple-50' :
                                  'bg-gray-50';

                        return (
                          <div
                            key={slot + slotIdx}
                            className={`rounded-xl p-3 shadow-sm border border-gray-100 ${statusBgClass} flex flex-col gap-2 relative min-h-[100px] group hover:shadow-lg transition-all duration-200 cursor-pointer`}
                            onClick={() => handleAppointmentClick(appointment._id)}
                            title="Click để xem chi tiết"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#014091' }}>
                                <Clock size={16} className="mr-1 text-gray-400" />
                                <span>{hour}</span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold border-2 border-white flex-shrink-0">
                                {customerName.charAt(0)}
                              </div>
                              <div className="min-w-0 ml-2">
                                <div className="font-medium truncate text-sm" style={{ color: '#014091' }}>
                                  {customerName}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {appointment.status}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 truncate">
                                {appointment.serviceID || ''}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TechnicianSchedule;
