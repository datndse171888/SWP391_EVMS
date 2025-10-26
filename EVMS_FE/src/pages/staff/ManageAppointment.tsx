import React, { useState } from 'react';

// Add custom CSS for line-clamp
const customStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleType: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  notes?: string;
  createdAt: string;
}

const ManageAppointment: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'all' | 'confirmed' | 'completed'>('pending');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTimeSlot, setFilterTimeSlot] = useState('');
  const [filterServiceType, setFilterServiceType] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Mock data - thay thế bằng API call thực tế
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      customerName: 'Nguyễn Văn An',
      customerPhone: '0123456789',
      vehicleType: 'Xe máy Honda Wave',
      serviceType: 'Bảo dưỡng định kỳ',
      appointmentDate: '2024-01-15',
      appointmentTime: '09:00',
      status: 'pending',
      notes: 'Khách hàng yêu cầu kiểm tra phanh và thay dầu',
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      customerName: 'Trần Thị Bình',
      customerPhone: '0987654321',
      vehicleType: 'Ô tô Toyota Vios',
      serviceType: 'Sửa chữa động cơ',
      appointmentDate: '2024-01-16',
      appointmentTime: '14:00',
      status: 'confirmed',
      notes: 'Động cơ có tiếng kêu lạ khi khởi động',
      createdAt: '2024-01-11'
    },
    {
      id: '3',
      customerName: 'Lê Văn Cường',
      customerPhone: '0369852147',
      vehicleType: 'Xe máy Yamaha Exciter',
      serviceType: 'Thay nhớt và lọc gió',
      appointmentDate: '2024-01-12',
      appointmentTime: '10:30',
      status: 'completed',
      notes: 'Đã hoàn thành dịch vụ',
      createdAt: '2024-01-08'
    },
    {
      id: '4',
      customerName: 'Phạm Thị Dung',
      customerPhone: '0912345678',
      vehicleType: 'Ô tô Honda City',
      serviceType: 'Kiểm tra hệ thống điện',
      appointmentDate: '2024-01-18',
      appointmentTime: '08:30',
      status: 'pending',
      notes: 'Đèn báo lỗi động cơ sáng',
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      customerName: 'Hoàng Văn Em',
      customerPhone: '0976543210',
      vehicleType: 'Xe máy Suzuki Raider',
      serviceType: 'Sửa chữa hệ thống phanh',
      appointmentDate: '2024-01-14',
      appointmentTime: '15:00',
      status: 'confirmed',
      notes: 'Phanh không ăn, cần kiểm tra gấp',
      createdAt: '2024-01-09'
    },
    {
      id: '6',
      customerName: 'Võ Thị Phương',
      customerPhone: '0934567890',
      vehicleType: 'Xe máy Honda Air Blade',
      serviceType: 'Bảo dưỡng định kỳ',
      appointmentDate: '2024-01-20',
      appointmentTime: '11:00',
      status: 'pending',
      notes: 'Thay dầu máy và kiểm tra lốp xe',
      createdAt: '2024-01-13'
    },
    {
      id: '7',
      customerName: 'Đặng Văn Giang',
      customerPhone: '0945678901',
      vehicleType: 'Ô tô Hyundai Accent',
      serviceType: 'Sửa chữa động cơ',
      appointmentDate: '2024-01-22',
      appointmentTime: '13:30',
      status: 'confirmed',
      notes: 'Động cơ bị rung lắc khi chạy tốc độ cao',
      createdAt: '2024-01-14'
    },
    {
      id: '8',
      customerName: 'Bùi Thị Hoa',
      customerPhone: '0956789012',
      vehicleType: 'Xe máy Piaggio Vespa',
      serviceType: 'Kiểm tra hệ thống điện',
      appointmentDate: '2024-01-19',
      appointmentTime: '16:00',
      status: 'completed',
      notes: 'Đã sửa xong hệ thống đèn và còi',
      createdAt: '2024-01-15'
    },
    {
      id: '9',
      customerName: 'Ngô Văn Khoa',
      customerPhone: '0967890123',
      vehicleType: 'Ô tô Ford Ranger',
      serviceType: 'Thay nhớt và lọc gió',
      appointmentDate: '2024-01-21',
      appointmentTime: '09:30',
      status: 'pending',
      notes: 'Bảo dưỡng định kỳ 20,000km',
      createdAt: '2024-01-16'
    },
    {
      id: '10',
      customerName: 'Lý Thị Lan',
      customerPhone: '0978901234',
      vehicleType: 'Xe máy Kawasaki Ninja',
      serviceType: 'Sửa chữa hệ thống phanh',
      appointmentDate: '2024-01-23',
      appointmentTime: '14:30',
      status: 'confirmed',
      notes: 'Phanh trước bị kẹt, cần thay thế',
      createdAt: '2024-01-17'
    },
    {
      id: '11',
      customerName: 'Phan Văn Minh',
      customerPhone: '0989012345',
      vehicleType: 'Ô tô Mazda CX-5',
      serviceType: 'Bảo dưỡng định kỳ',
      appointmentDate: '2024-01-24',
      appointmentTime: '10:00',
      status: 'completed',
      notes: 'Hoàn thành bảo dưỡng 30,000km',
      createdAt: '2024-01-18'
    },
    {
      id: '12',
      customerName: 'Trịnh Thị Nga',
      customerPhone: '0990123456',
      vehicleType: 'Xe máy SYM Attila',
      serviceType: 'Kiểm tra hệ thống điện',
      appointmentDate: '2024-01-25',
      appointmentTime: '15:30',
      status: 'pending',
      notes: 'Ắc quy yếu, cần kiểm tra hệ thống sạc',
      createdAt: '2024-01-19'
    },
    {
      id: '13',
      customerName: 'Hồ Văn Oanh',
      customerPhone: '0901234567',
      vehicleType: 'Ô tô Kia Seltos',
      serviceType: 'Sửa chữa động cơ',
      appointmentDate: '2024-01-26',
      appointmentTime: '08:00',
      status: 'confirmed',
      notes: 'Động cơ có tiếng kêu bất thường khi khởi động lạnh',
      createdAt: '2024-01-20'
    },
    {
      id: '14',
      customerName: 'Đinh Thị Phượng',
      customerPhone: '0912345678',
      vehicleType: 'Xe máy Yamaha Grande',
      serviceType: 'Thay nhớt và lọc gió',
      appointmentDate: '2024-01-27',
      appointmentTime: '12:00',
      status: 'completed',
      notes: 'Đã thay dầu máy và lọc gió mới',
      createdAt: '2024-01-21'
    }
  ];

  // Filter function
  const filterAppointments = (appointments: Appointment[]) => {
    return appointments.filter(appointment => {
      // Search by name or phone
      const matchesSearch = searchTerm === '' || 
        appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.customerPhone.includes(searchTerm);
      
      // Filter by selected date from calendar
      let matchesDate = true;
      if (selectedDate) {
        const appointmentDate = new Date(appointment.appointmentDate);
        matchesDate = appointmentDate.toDateString() === selectedDate.toDateString();
      }
      
      // Filter by time slot
      const appointmentTime = appointment.appointmentTime;
      const matchesTimeSlot = filterTimeSlot === '' || 
        (filterTimeSlot === 'morning' && appointmentTime >= '08:00' && appointmentTime <= '12:00') ||
        (filterTimeSlot === 'afternoon' && appointmentTime >= '12:00' && appointmentTime <= '19:00');
      
      // Filter by service type
      const matchesServiceType = filterServiceType === '' || 
        appointment.serviceType === filterServiceType;
      
      return matchesSearch && matchesDate && matchesTimeSlot && matchesServiceType;
    });
  };

  const pendingAppointments = filterAppointments(mockAppointments.filter(apt => apt.status === 'pending'));
  const confirmedAppointments = filterAppointments(mockAppointments.filter(apt => apt.status === 'confirmed'));
  const completedAppointments = filterAppointments(mockAppointments.filter(apt => apt.status === 'completed'));
  const allAppointments = filterAppointments(mockAppointments);

  // Get current data based on selected tab
  const getCurrentData = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingAppointments;
      case 'all':
        return allAppointments;
      case 'confirmed':
        return confirmedAppointments;
      case 'completed':
        return completedAppointments;
      default:
        return pendingAppointments;
    }
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTimeSlot, filterServiceType, selectedDate, selectedTab]);

  const handleConfirmAppointment = (appointmentId: string) => {
    console.log('Confirm appointment:', appointmentId);
    // Thực hiện API call để confirm appointment
  };

  const handleRejectAppointment = (appointmentId: string) => {
    console.log('Reject appointment:', appointmentId);
    // Thực hiện API call để reject appointment
  };

  const handleViewDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'Đã xác nhận', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Đã từ chối', color: 'bg-red-100 text-red-800' },
      completed: { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Pagination component
  const renderPagination = () => {
    if (currentData.length === 0) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-1 p-1 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Hiển thị:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={9}>9</option>
            <option value={18}>18</option>
            <option value={27}>27</option>
            <option value={36}>36</option>
          </select>
          <span className="text-sm text-gray-600">
            {startIndex + 1}-{Math.min(endIndex, currentData.length)} trong {currentData.length} lịch hẹn
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* First page button << */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Previous button < */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* First page */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="w-8 h-8 flex items-center justify-center text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-700">...</span>}
            </>
          )}

          {/* Page numbers */}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${
                currentPage === page
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Last page */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-gray-700">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-8 h-8 flex items-center justify-center text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next button > */}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Last page button >> */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Calendar component
  const Calendar = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());
    const [currentYear, setCurrentYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    const handleDateClick = (day: number) => {
      const newDate = new Date(currentYear, currentMonth, day);
      setSelectedDate(newDate);
    };
    
    const clearDate = () => {
      setSelectedDate(null);
    };
    
    const goToPreviousMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    };
    
    const goToNextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    };
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Lịch hẹn</h3>
          {selectedDate && (
            <button
              onClick={clearDate}
              className="text-xs text-yellow-600 hover:text-yellow-800"
            >
              Xóa
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h4 className="text-xs font-medium text-gray-800">{monthNames[currentMonth]} {currentYear}</h4>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayWeekday }, (_, i) => (
            <div key={`empty-${i}`} className="h-6"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth;
            const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
            
            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`h-6 w-6 text-xs rounded-full hover:bg-yellow-100 transition-colors ${
                  isSelected 
                    ? 'bg-yellow-500 text-white' 
                    : isToday 
                    ? 'bg-yellow-100 text-yellow-600 font-semibold'
                    : 'text-gray-700 hover:text-yellow-600'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        
        {selectedDate && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
            Đã chọn: {selectedDate.toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>
    );
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const cardColors = [
      'bg-blue-50',
      'bg-green-50', 
      'bg-pink-50',
      'bg-purple-50',
      'bg-yellow-50',
      'bg-indigo-50'
    ];
    
    const randomColor = cardColors[Math.floor(Math.random() * cardColors.length)];
    
    return (
      <div key={appointment.id} className={`${randomColor} rounded-lg p-3 hover:shadow-md transition-all duration-300 h-45 flex flex-col`}>
        {/* Header với avatar và bookmark */}
        <div className="flex items-start justify-between mb-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            {/* Avatar khách hàng */}
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold text-xs shadow-sm">
              {appointment.customerName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 text-xs truncate">{appointment.customerName}</h3>
              <p className="text-xs text-gray-600 truncate">{appointment.customerPhone}</p>
            </div>
          </div>
          {/* Bookmark icon */}
          <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-700 mb-2 leading-relaxed truncate flex-shrink-0">
          {appointment.notes || `Dịch vụ ${appointment.serviceType} cho ${appointment.vehicleType}`}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2 flex-shrink-0">
          <span className="px-1.5 py-0.5 bg-white bg-opacity-60 text-gray-700 rounded-full text-xs font-medium truncate max-w-[120px]">
            {appointment.serviceType}
          </span>
          <span className="px-1.5 py-0.5 bg-white bg-opacity-60 text-gray-700 rounded-full text-xs font-medium truncate max-w-[120px]">
            {appointment.vehicleType}
          </span>
        </div>

        {/* Time info */}
        <div className="mb-2 flex-shrink-0">
          <div className="flex items-center text-xs text-gray-600">
            <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{appointment.appointmentDate} - {appointment.appointmentTime}</span>
          </div>
        </div>

        {/* Footer với buttons - fixed at bottom */}
        <div className="flex justify-between items-center mt-auto">
          <button
            onClick={() => handleViewDetail(appointment)}
            className="px-2 py-1 bg-white text-gray-700 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            Chi tiết
          </button>
          
          {appointment.status === 'pending' ? (
            <div className="flex space-x-1">
              <button
                onClick={() => handleConfirmAppointment(appointment.id)}
                className="px-2 py-1 bg-gray-800 text-white rounded text-xs font-medium hover:bg-gray-900 transition-colors"
              >
                Xác nhận
              </button>
              <button
                onClick={() => handleRejectAppointment(appointment.id)}
                className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
              >
                Từ chối
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleViewDetail(appointment)}
              className="px-2 py-1 bg-gray-800 text-white rounded text-xs font-medium hover:bg-gray-900 transition-colors"
            >
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 pb-8">
      

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-1">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-2 flex flex-col">
            {/* Header with Search */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              {/* Title - Left aligned */}
              <h2 className="text-base font-semibold" style={{ color: '#014091' }}>
                Lịch hẹn hôm nay ({allAppointments.length})
              </h2>
              
              {/* Search Bar - Right aligned */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên khách hàng hoặc số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-96 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-2 flex-shrink-0">
              <nav className="flex space-x-4 border-b">
                <button
                  onClick={() => setSelectedTab('pending')}
                  className={`py-1 px-1 border-b-2 font-medium text-xs ${
                    selectedTab === 'pending'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Chờ xác nhận ({pendingAppointments.length})
                </button>
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`py-1 px-1 border-b-2 font-medium text-xs ${
                    selectedTab === 'all'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Tất cả ({allAppointments.length})
                </button>
                <button
                  onClick={() => setSelectedTab('confirmed')}
                  className={`py-1 px-1 border-b-2 font-medium text-xs ${
                    selectedTab === 'confirmed'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Đã xác nhận ({confirmedAppointments.length})
                </button>
                <button
                  onClick={() => setSelectedTab('completed')}
                  className={`py-1 px-1 border-b-2 font-medium text-xs ${
                    selectedTab === 'completed'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Hoàn thành ({completedAppointments.length})
                </button>
              </nav>
            </div>

            {/* Content Grid */}
            <div 
              className={`grid gap-3 ${
                paginatedData.length > 9 ? 'overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''
              }`}
              style={{
                height: paginatedData.length > 9 ? '500px' : 'auto',
                scrollbarWidth: paginatedData.length > 9 ? 'thin' : 'auto',
                scrollbarColor: paginatedData.length > 9 ? '#d1d5db #f3f4f6' : 'auto',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gridAutoRows: 'minmax(180px, auto)'
              }}
            >
              {paginatedData.map(renderAppointmentCard)}
            </div>

            {/* Pagination */}
            <div className="flex-shrink-0 mt-2">
              {renderPagination()}
            </div>

            {/* Empty State */}
            {currentData.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {selectedTab === 'pending' && 'Không có lịch hẹn chờ xác nhận'}
                  {selectedTab === 'all' && 'Không có lịch hẹn nào'}
                  {selectedTab === 'confirmed' && 'Không có lịch hẹn đã xác nhận'}
                  {selectedTab === 'completed' && 'Không có lịch hẹn hoàn thành'}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedTab === 'pending' && 'Tất cả lịch hẹn đã được xử lý.'}
                  {selectedTab === 'all' && 'Chưa có lịch hẹn nào được tạo.'}
                  {selectedTab === 'confirmed' && 'Chưa có lịch hẹn nào được xác nhận.'}
                  {selectedTab === 'completed' && 'Chưa có lịch hẹn nào được hoàn thành.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Filters</h2>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterTimeSlot('');
                  setFilterServiceType('');
                  setSelectedDate(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
            </div>

            {/* Calendar */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <Calendar />
            </div>


            {/* Service Type Filter */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-800 mb-3">Loại dịch vụ</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 bg-gray-100 border border-gray-300 rounded-full appearance-none checked:bg-orange-200 focus:ring-orange-500 focus:ring-2" />
                  <span className="text-sm text-gray-700">Bảo dưỡng định kỳ</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 bg-gray-100 border border-gray-300 rounded-full appearance-none checked:bg-orange-200 focus:ring-orange-500 focus:ring-2" />
                  <span className="text-sm text-gray-700">Sửa chữa động cơ</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 bg-gray-100 border border-gray-300 rounded-full appearance-none checked:bg-orange-200 focus:ring-orange-500 focus:ring-2" />
                  <span className="text-sm text-gray-700">Thay nhớt và lọc gió</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 bg-gray-100 border border-gray-300 rounded-full appearance-none checked:bg-orange-200 focus:ring-orange-500 focus:ring-2" />
                  <span className="text-sm text-gray-700">Kiểm tra hệ thống điện</span>
                </label>
              </div>
            </div>

            {/* Vehicle Type Filter */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-800 mb-3">Loại xe</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 bg-gray-100 border border-gray-300 rounded-full appearance-none checked:bg-orange-200 focus:ring-orange-500 focus:ring-2" />
                  <span className="text-sm text-gray-700">Xe máy</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3 w-4 h-4 bg-gray-100 border border-gray-300 rounded-full appearance-none checked:bg-orange-200 focus:ring-orange-500 focus:ring-2" />
                  <span className="text-sm text-gray-700">Ô tô</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết lịch hẹn</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Khách hàng</label>
                  <p className="text-gray-900">{selectedAppointment.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-gray-900">{selectedAppointment.customerPhone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại xe</label>
                  <p className="text-gray-900">{selectedAppointment.vehicleType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dịch vụ</label>
                  <p className="text-gray-900">{selectedAppointment.serviceType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày hẹn</label>
                  <p className="text-gray-900">{selectedAppointment.appointmentDate} - {selectedAppointment.appointmentTime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Đóng
                </button>
                {selectedAppointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleConfirmAppointment(selectedAppointment.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={() => {
                        handleRejectAppointment(selectedAppointment.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointment;