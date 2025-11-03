import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

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
  { weekName: "Tuần thứ 4", days: generateWeekData(3) }
];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

const shiftOptions = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Ca sáng', value: 'morning' },
  { label: 'Ca chiều', value: 'afternoon' }
];

const statusOptions = ['Tất cả', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

// Appointment data interface
interface AppointmentData {
  _id: string;
  bookingDate: string;
  serviceID?: { name: string };
  userID?: { fullName: string };
  status: string;
  vehicleID: string;
}

// Mock appointments data - Hôm nay có nhiều appointments
const mockAppointments: AppointmentData[] = [
  // Hôm nay - đầy đủ lịch
  {
    _id: '1',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 8, 0).toISOString(),
    serviceID: { name: 'Thay nhớt động cơ' },
    userID: { fullName: 'Nguyễn Văn A' },
    status: 'confirmed',
    vehicleID: 'v001'
  },
  {
    _id: '2',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9, 0).toISOString(),
    serviceID: { name: 'Bảo dưỡng định kỳ' },
    userID: { fullName: 'Trần Thị Mai' },
    status: 'confirmed',
    vehicleID: 'v006'
  },
  {
    _id: '3',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0).toISOString(),
    serviceID: { name: 'Sửa chữa phanh' },
    userID: { fullName: 'Trần Thị B' },
    status: 'in_progress',
    vehicleID: 'v002'
  },
  {
    _id: '4',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 11, 0).toISOString(),
    serviceID: { name: 'Kiểm tra điện' },
    userID: { fullName: 'Lê Minh Cường' },
    status: 'pending',
    vehicleID: 'v007'
  },
  {
    _id: '5',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 13, 0).toISOString(),
    serviceID: { name: 'Thay bugi' },
    userID: { fullName: 'Phạm Văn Đức' },
    status: 'confirmed',
    vehicleID: 'v008'
  },
  {
    _id: '6',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 14, 0).toISOString(),
    serviceID: { name: 'Vệ sinh động cơ' },
    userID: { fullName: 'Hoàng Thị Lan' },
    status: 'confirmed',
    vehicleID: 'v009'
  },
  {
    _id: '7',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 15, 0).toISOString(),
    serviceID: { name: 'Sửa hệ thống làm mát' },
    userID: { fullName: 'Nguyễn Văn Hoàng' },
    status: 'in_progress',
    vehicleID: 'v010'
  },
  {
    _id: '8',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 16, 0).toISOString(),
    serviceID: { name: 'Kiểm tra bảo hiểm' },
    userID: { fullName: 'Lê Thị Hương' },
    status: 'pending',
    vehicleID: 'v011'
  },
  {
    _id: '9',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 17, 0).toISOString(),
    serviceID: { name: 'Bảo dưỡng nước làm mát' },
    userID: { fullName: 'Trần Văn Nam' },
    status: 'confirmed',
    vehicleID: 'v012'
  },
  // Ngày mai
  {
    _id: '10',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 8, 0).toISOString(),
    serviceID: { name: 'Kiểm tra tổng thể' },
    userID: { fullName: 'Lê Văn C' },
    status: 'pending',
    vehicleID: 'v003'
  },
  {
    _id: '11',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 10, 0).toISOString(),
    serviceID: { name: 'Thay lốp xe' },
    userID: { fullName: 'Phạm Thị Dung' },
    status: 'confirmed',
    vehicleID: 'v013'
  },
  {
    _id: '12',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 14, 0).toISOString(),
    serviceID: { name: 'Sửa hộp số' },
    userID: { fullName: 'Nguyễn Minh Tuấn' },
    status: 'confirmed',
    vehicleID: 'v014'
  },
  {
    _id: '13',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 16, 0).toISOString(),
    serviceID: { name: 'Bảo dưỡng định kỳ' },
    userID: { fullName: 'Hoàng Văn E' },
    status: 'completed',
    vehicleID: 'v005'
  },
  // Ngày kia
  {
    _id: '14',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 9, 0).toISOString(),
    serviceID: { name: 'Thay lốp xe' },
    userID: { fullName: 'Phạm Văn D' },
    status: 'confirmed',
    vehicleID: 'v004'
  },
  {
    _id: '15',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 13, 0).toISOString(),
    serviceID: { name: 'Kiểm tra phanh' },
    userID: { fullName: 'Lê Thị Thu' },
    status: 'pending',
    vehicleID: 'v015'
  },
  {
    _id: '16',
    bookingDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 15, 0).toISOString(),
    serviceID: { name: 'Thay dầu phanh' },
    userID: { fullName: 'Trần Đức Anh' },
    status: 'confirmed',
    vehicleID: 'v016'
  },
];

const TechnicianSchedule: React.FC = () => {
  const [weekIndex, setWeekIndex] = useState(0);
  const navigate = useNavigate();
  const [shift, setShift] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');
  const [appointments] = useState(mockAppointments);

  // Helper: Get appointment start time
  const getAppointmentStartTime = (app: AppointmentData) => {
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
          className="px-4 py-2 rounded-lg border border-gray-200" 
          style={{ color: '#014091' }}
          value={selectedStatus} 
          onChange={e => setSelectedStatus(e.target.value)}
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="flex-1"></div>
        <div className="flex gap-1">
          {shiftOptions.map(opt => (
            <button
              key={opt.value}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 ${
                shift === opt.value ? 'bg-blue-100' : 'bg-gray-100'
              }`}
              style={{ color: shift === opt.value ? '#3b82f6' : '#014091' }}
              onClick={() => setShift(opt.value as 'all' | 'morning' | 'afternoon')}
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
            if (selectedStatus !== 'Tất cả') {
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
                        const customerName = appointment.userID?.fullName || 'Không rõ tên';

                        // Get status color class
                        const statusBgClass = 
                          appointment.status === 'completed' ? 'bg-green-50' :
                          appointment.status === 'confirmed' || appointment.status === 'scheduled' ? 'bg-blue-50' :
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
                                {appointment.serviceID?.name || ''}
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
