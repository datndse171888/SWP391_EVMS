import React, { useEffect, useState } from 'react';
import { AppointmentApi } from '../../api/AppointmentApi';
import { UserApi } from '../../api/UserApi';
import { ServiceApi } from '../../api/ServiceApi';
import { ServicePackageApi } from '../../api/ServicePackageApi';
import type { AppointmentResponse, AppointmentStatus } from '../../types/Appoitment';

// Add custom CSS for line-clamp
const customStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
  vehicleCategory?: 'CAR' | 'MOTOBIKE' | 'BICYCLE' | string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  bookingDateISO?: string;
  status: AppointmentStatus | 'rejected';
  notes?: string;
  createdAt: string;
  descriptionText: string;
  tags: string[];
  detailText?: string;
  kind?: 'service' | 'package';
}

const ManageAppointment: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('pending');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  // Deprecated filters (kept for potential extension)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Dữ liệu từ API
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Helper: normalize Vietnamese text (remove accents) for search
  const normalizeText = (input: string) => {
    if (!input) return '';
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .trim();
  };

  // Filters state
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]); // 'MOTOBIKE' | 'CAR' | 'BICYCLE'
  const [selectedStatuses, setSelectedStatuses] = useState<AppointmentStatus[]>([]);
  const [selectedKinds, setSelectedKinds] = useState<string[]>([]); // 'service' | 'package'

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
  };
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await AppointmentApi.getAllAppointments();
        const baseList: AppointmentResponse[] = res.data?.data || [];
        // Helpers to read ids with various field names from BE
        const getServiceId = (a: unknown): string | undefined => {
          const obj = a as Record<string, unknown>;
          const sid: unknown = obj?.serviceID ?? obj?.serviceId ?? obj?.service;
          if (!sid) return undefined;
          if (typeof sid === 'string') return sid;
          if (typeof sid === 'object' && sid !== null) {
            const o = sid as Record<string, unknown>;
            return String((o._id as string) || (o.id as string) || '');
          }
          return undefined;
        };
        const getServicePackageId = (a: unknown): string | undefined => {
          const obj = a as Record<string, unknown>;
          const pid: unknown = obj?.servicePackageID ?? obj?.servicePackageId ?? obj?.servicePackage;
          if (!pid) return undefined;
          if (typeof pid === 'string') return pid;
          if (typeof pid === 'object' && pid !== null) {
            const o = pid as Record<string, unknown>;
            return String((o._id as string) || (o.id as string) || '');
          }
          return undefined;
        };
        // Lấy danh sách user theo userID (unique) để lấy tên/sđt
        const uniqueUserIds = Array.from(new Set(baseList.map(a => a.userID).filter(Boolean)));
        const userCache = new Map<string, { fullName?: string; userName?: string; phoneNumber?: string }>();

        await Promise.all(uniqueUserIds.map(async (uid) => {
          try {
            const ures = await UserApi.getUserById(uid);
            const udata: { fullName?: string; userName?: string; phoneNumber?: string } | undefined = ures?.data;
            userCache.set(uid, {
              fullName: udata?.fullName,
              userName: udata?.userName,
              phoneNumber: udata?.phoneNumber,
            });
          } catch {
            userCache.set(uid, {});
          }
        }));

        // Chuẩn bị caches cho service và service package
        const serviceIds = Array.from(new Set(baseList.map(a => getServiceId(a)).filter(Boolean))) as string[];
        const servicePackageIds = Array.from(new Set(baseList.map(a => getServicePackageId(a)).filter(Boolean))) as string[];

        type ServiceLite = { name?: string; description?: string; vehicleCategory?: string } | undefined;
        type ServicePackageLite = { name?: string; services?: Array<{ name?: string }>; serviceIds?: string[]; data?: { services?: Array<{ name?: string }> } } | undefined;

        const serviceCache = new Map<string, ServiceLite>();
        const servicePackageCache = new Map<string, ServicePackageLite>();

        await Promise.all([
          ...serviceIds.map(async (sid) => {
            try {
              const sres = await ServiceApi.getServiceById(sid);
              const raw = sres?.data as unknown as Record<string, unknown>;
              const getProp = (o: unknown, key: string) => (o && typeof o === 'object' && key in (o as Record<string, unknown>) ? (o as Record<string, unknown>)[key] : undefined);
              const svcObj = (raw && (raw as Record<string, unknown>).name)
                ? raw
                : (getProp(raw, 'service') || getProp(getProp(raw, 'data'), 'service') || getProp(raw, 'data') || undefined);
              if (svcObj && typeof svcObj === 'object') {
                const so = svcObj as Record<string, unknown>;
                serviceCache.set(sid, {
                  name: (so.name as string | undefined),
                  description: (so.description as string | undefined),
                  vehicleCategory: (so.vehicleCategory as string | undefined),
                });
              } else {
                serviceCache.set(sid, undefined);
              }
            } catch {
              serviceCache.set(sid, undefined);
            }
          }),
          ...servicePackageIds.map(async (spid) => {
            try {
              const spres = await ServicePackageApi.getServicePackageById(spid);
              servicePackageCache.set(spid, spres?.data);
            } catch {
              servicePackageCache.set(spid, undefined);
            }
          })
        ]);

        const uiList: Appointment[] = baseList.map((apt) => {
          const u = userCache.get(apt.userID) || {};
          // Build description and tags
          let descriptionText = '';
          const tags: string[] = [];

          const svcId = getServiceId(apt);
          const pkgId = getServicePackageId(apt);

          // Nếu BE đã embed hẳn object service trong appointment thì ưu tiên dùng trực tiếp
          const embeddedService = (apt as unknown as { service?: { name?: string; description?: string; vehicleCategory?: string } }).service;

          if (embeddedService?.name || svcId) {
            const svc = embeddedService?.name ? embeddedService as { name?: string; description?: string; vehicleCategory?: string } : serviceCache.get(svcId || '');
            const svcName = (svc?.name) || 'Dịch vụ';
            descriptionText = svcName;
            // Thêm chi tiết mô tả (không phải tag)
            const svcDesc = svc && typeof (svc as { description?: string }).description === 'string' ? (svc as { description?: string }).description as string : '';
            if (svcDesc) {
              tags.length = 0; // đảm bảo không hiển thị tag cho service đơn
            }
          // Thêm tag/vehicleCategory nếu có (tuỳ chọn)
          let vc: string | undefined;
          if (svc && typeof (svc as { vehicleCategory?: string }).vehicleCategory === 'string') {
            vc = (svc as { vehicleCategory?: string }).vehicleCategory as string;
            tags.push(vc === 'MOTOBIKE' ? 'Xe máy' : (vc === 'CAR' ? 'Ô tô' : (vc === 'BICYCLE' ? 'Xe đạp' : vc)));
          }
          return {
              id: apt._id,
              customerName: u.fullName || u.userName || `Khách ${apt._id.slice(-4)}`,
              customerPhone: u.phoneNumber || '---',
              vehicleType: '',
            vehicleCategory: vc,
              serviceType: '',
              appointmentDate: formatDate(apt.bookingDate),
              appointmentTime: formatTime(apt.bookingDate),
            bookingDateISO: apt.bookingDate,
              status: apt.status,
              createdAt: apt.createdAt,
              descriptionText: descriptionText || 'Dịch vụ',
              tags,
              detailText: svcDesc,
            kind: 'service',
            };
          } else if (apt.servicePackageID) {
            const pack = pkgId ? servicePackageCache.get(pkgId) : undefined;
            const packName = (pack?.name) || 'Gói dịch vụ';
            descriptionText = packName;
            // Tag: loại xe của gói (nếu có)
            const vcPack = (pack as { vehicleCategory?: string } | undefined)?.vehicleCategory as string | undefined;
            const vcLabelPack = vcPack === 'MOTOBIKE' ? 'Xe máy' : vcPack === 'CAR' ? 'Ô tô' : vcPack === 'BICYCLE' ? 'Xe đạp' : undefined;
            if (vcLabelPack) {
              tags.push(vcLabelPack);
            }
          }

          return {
            id: apt._id,
            customerName: u.fullName || u.userName || `Khách ${apt._id.slice(-4)}`,
            customerPhone: u.phoneNumber || '---',
            vehicleType: '',
            vehicleCategory: (apt.servicePackageID ? ((servicePackageCache.get(getServicePackageId(apt) || '') as { vehicleCategory?: string } | undefined)?.vehicleCategory as string | undefined) : undefined),
            serviceType: '',
            appointmentDate: formatDate(apt.bookingDate),
            appointmentTime: formatTime(apt.bookingDate),
            bookingDateISO: apt.bookingDate,
            status: apt.status,
            createdAt: apt.createdAt,
            descriptionText: descriptionText || 'Dịch vụ',
            tags,
            detailText: undefined,
            kind: apt.servicePackageID ? 'package' : 'service',
          };
        });

        setAppointments(uiList);
      } catch {
        setError('Không thể tải danh sách lịch hẹn');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter function
  const filterAppointments = (appointmentsInput: Appointment[]) => {
    return appointmentsInput.filter(appointment => {
      // Search by name or phone
      const q = searchTerm || '';
      const qNorm = normalizeText(q);
      const nameNorm = normalizeText(appointment.customerName);
      const phoneFlat = (appointment.customerPhone || '').replace(/\s+/g, '');
      const qFlat = q.replace(/\s+/g, '');
      const matchesSearch = qNorm === '' ||
        nameNorm.includes(qNorm) ||
        phoneFlat.includes(qFlat);
      
      // Filter by selected date from calendar
          let matchesDate = true;
          if (selectedDate) {
        const appointmentDate = new Date((appointment as { bookingDateISO?: string; appointmentDate: string }).bookingDateISO || appointment.appointmentDate);
        matchesDate = appointmentDate.toDateString() === selectedDate.toDateString();
      }
      
      // Vehicle filter (multi-select)
      const matchesVehicle = selectedVehicleTypes.length === 0 ||
        (appointment.vehicleCategory ? selectedVehicleTypes.includes(appointment.vehicleCategory) : false);

      // Status filter (multi-select) - keep but optional
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(appointment.status as AppointmentStatus);

      // Kind filter (service/package)
      const matchesKind = selectedKinds.length === 0 || (appointment.kind ? selectedKinds.includes(appointment.kind) : false);
      
      return matchesSearch && matchesDate && matchesVehicle && matchesStatus && matchesKind;
    });
  };

  const pendingAppointments = filterAppointments(appointments.filter(apt => apt.status === 'pending'));
  const confirmedAppointments = filterAppointments(appointments.filter(apt => apt.status === 'confirmed'));
  const inProgressAppointments = filterAppointments(appointments.filter(apt => apt.status === 'in_progress'));
  const cancelledAppointments = filterAppointments(appointments.filter(apt => apt.status === 'cancelled'));
  const completedAppointments = filterAppointments(appointments.filter(apt => apt.status === 'completed'));
  const allAppointments = filterAppointments(appointments);

  // Get current data based on selected tab
  const getCurrentData = () => {
    switch (selectedTab) {
      case 'all':
        return allAppointments;
      case 'pending':
        return pendingAppointments;
      case 'confirmed':
        return confirmedAppointments;
      case 'in_progress':
        return inProgressAppointments;
      case 'cancelled':
        return cancelledAppointments;
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
  }, [searchTerm, selectedVehicleTypes, selectedStatuses, selectedKinds, selectedDate, selectedTab]);

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await AppointmentApi.updateAppointmentStatus(appointmentId, { status: 'confirmed' });
      setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, status: 'confirmed' } : a)));
    } catch {
      setError('Không thể xác nhận lịch hẹn');
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      await AppointmentApi.updateAppointmentStatus(appointmentId, { status: 'cancelled' });
      setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled' } : a)));
    } catch {
      setError('Không thể từ chối lịch hẹn');
    }
  };

  const handleViewDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; color: string }> = {
      pending: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'Đã xác nhận', color: 'bg-green-100 text-green-800' },
      in_progress: { text: 'Đang tiến hành', color: 'bg-indigo-100 text-indigo-800' },
      completed: { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-800' },
      cancelled: { text: 'Đã hủy', color: 'bg-pink-100 text-pink-800' },
      no_show: { text: 'Không đến', color: 'bg-gray-100 text-gray-800' },
      rejected: { text: 'Đã từ chối', color: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>;
  };

  // Pagination component
  const renderPagination = () => {
    if (currentData.length === 0) return null;

    const pageNumbers = [] as number[];
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
    const statusToColor: Record<string, string> = {
      pending: 'bg-yellow-50',
      confirmed: 'bg-green-50',
      in_progress: 'bg-indigo-50',
      completed: 'bg-blue-50',
      cancelled: 'bg-pink-50',
      no_show: 'bg-purple-50',
      rejected: 'bg-pink-50',
    };
    const colorClass = statusToColor[String(appointment.status)] || 'bg-white';
    
    return (
      <div key={appointment.id} className={`${colorClass} rounded-lg p-3 hover:shadow-md transition-all duration-300 h-45 flex flex-col`}>
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
          {appointment.descriptionText}
        </p>

        {/* Tags or detail description (for single service) */}
        {appointment.tags && appointment.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-2 flex-shrink-0">
            {appointment.tags.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 bg-white bg-opacity-60 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[16ch]">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          appointment.detailText ? (
            <div className="text-xs text-gray-500 mb-2 line-clamp-2">{appointment.detailText}</div>
          ) : null
        )}

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
          {appointment.status === 'pending' && (
            <button
              type="button"
              onClick={() => handleViewDetail(appointment)}
              className="px-2 py-1 bg-white text-gray-700 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Chi tiết
            </button>
          )}

          {appointment.status === 'pending' ? (
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => handleConfirmAppointment(appointment.id)}
                className="px-2 py-1 bg-gray-800 text-white rounded text-xs font-medium hover:bg-gray-900 transition-colors"
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={() => handleRejectAppointment(appointment.id)}
                className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
              >
                Từ chối
              </button>
            </div>
          ) : (
            <button
              type="button"
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
              <nav className="flex space-x-4 border-b overflow-x-auto flex-nowrap no-scrollbar">
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`py-1 px-1 border-b-2 font-medium text-xs whitespace-nowrap max-w-[180px] truncate ${
                    selectedTab === 'all'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Tất cả ({allAppointments.length})
                </button>
                <button
                  onClick={() => setSelectedTab('pending')}
                  className={`py-1 px-1 border-b-2 font-medium text-xs whitespace-nowrap max-w-[180px] truncate ${
                    selectedTab === 'pending'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Chờ xác nhận ({pendingAppointments.length})
                </button>
                <button
                  onClick={() => setSelectedTab('confirmed')}
                  className={`py-1 px-1 border-b-2 font-medium text-xs whitespace-nowrap max-w-[180px] truncate ${
                    selectedTab === 'confirmed'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Đã xác nhận ({confirmedAppointments.length})
                </button>
                <button
                  onClick={() => setSelectedTab('in_progress')}
                  className={`py-1 px-1 border-b-2 font-medium text-xs whitespace-nowrap max-w-[180px] truncate ${
                    selectedTab === 'in_progress'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Đang tiến hành ({inProgressAppointments.length})
                </button>
                <button
                  onClick={() => setSelectedTab('completed')}
                  className={`py-1 px-1 border-b-2 font-medium text-xs whitespace-nowrap max-w-[180px] truncate ${
                    selectedTab === 'completed'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Hoàn thành ({completedAppointments.length})
                </button>
                <button
                  onClick={() => setSelectedTab('cancelled')}
                  className={`py-1 px-1 border-b-2 font-medium text-xs whitespace-nowrap max-w-[180px] truncate ${
                    selectedTab === 'cancelled'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Đã hủy ({cancelledAppointments.length})
                </button>
              </nav>
            </div>

            {/* Loading / Error */}
            {loading && (
              <div className="mb-2 text-sm text-gray-600">Đang tải danh sách lịch hẹn...</div>
            )}
            {error && (
              <div className="mb-2 text-sm text-red-600">{error}</div>
            )}

            {/* Content Grid */}
            <div 
              className={`grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${
                paginatedData.length > 9 ? 'overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''
              }`}
              style={{
                height: paginatedData.length > 9 ? '500px' : 'auto',
                scrollbarWidth: paginatedData.length > 9 ? 'thin' : 'auto',
                scrollbarColor: paginatedData.length > 9 ? '#d1d5db #f3f4f6' : 'auto'
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
                  setSelectedDate(null);
                  setSelectedVehicleTypes([]);
                  setSelectedStatuses([]);
                  setSelectedKinds([]);
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

            {/* Kind Filter */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-800 mb-3">Loại lịch hẹn</h3>
              <div className="space-y-2">
                {[
                  { key: 'service', label: 'Dịch vụ lẻ' },
                  { key: 'package', label: 'Gói dịch vụ' },
                ].map((k) => (
                  <label key={k.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedKinds.includes(k.key)}
                      onChange={() => {
                        setSelectedKinds((prev) =>
                          prev.includes(k.key)
                            ? prev.filter((x) => x !== k.key)
                            : [...prev, k.key]
                        );
                      }}
                      className="mr-3 w-4 h-4 bg-gray-100 border border-gray-300 rounded-full appearance-none checked:bg-orange-200 focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{k.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Vehicle Type Filter */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-800 mb-3">Loại xe</h3>
              <div className="space-y-2">
                {[
                  { key: 'MOTOBIKE', label: 'Xe máy' },
                  { key: 'CAR', label: 'Ô tô' },
                  { key: 'BICYCLE', label: 'Xe đạp' },
                ].map((v) => (
                  <label key={v.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedVehicleTypes.includes(v.key)}
                      onChange={() => {
                        setSelectedVehicleTypes((prev) =>
                          prev.includes(v.key)
                            ? prev.filter((x) => x !== v.key)
                            : [...prev, v.key]
                        );
                      }}
                      className="mr-3 w-4 h-4 bg-gray-100 border border-gray-300 rounded-full appearance-none checked:bg-orange-200 focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{v.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
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

export default ManageAppointment;