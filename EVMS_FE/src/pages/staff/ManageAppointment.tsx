// src/pages/staff/ManageAppointment.tsx - Updated with filters and pagination
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Car, Wrench, Package, Filter, Search, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { AppointmentResponse, AppointmentStatus } from '../../types/Appoitment';
import { AppointmentApi } from '../../api/AppointmentApi';
import AppointmentDetailModal from './../../components/ui/AppointmentDetailModal';
import { formatDate, formatTime } from '../../utils/DataFormat';
import type { FilteredDataResponse } from '../../types/DataResponse';
import { Input } from '../../components/ui/Input';

const ManageAppointment: React.FC = () => {
  // ================================
  // States
  // ================================

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // ================================
  // Effects
  // ================================

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, selectedStatus, dateRange]);

  // ================================
  // API Calls
  // ================================

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AppointmentApi.getAllAppointments();
      const appointmentData: FilteredDataResponse<AppointmentResponse> = response.data;

      if (Array.isArray(appointmentData.data)) {
        setAppointments(appointmentData.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Không thể tải danh sách lịch hẹn');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await AppointmentApi.updateAppointmentStatus(appointmentId, { status: newStatus });

      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('Không thể cập nhật trạng thái lịch hẹn');
    }
  };

  // ================================
  // Filters & Pagination
  // ================================

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(apt =>
        apt._id.toLowerCase().includes(searchLower) ||
        apt.userID?.toLowerCase().includes(searchLower) ||
        apt.vehicleID?.toLowerCase().includes(searchLower) ||
        apt.serviceID?.toLowerCase().includes(searchLower) ||
        apt.servicePackageID?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // Include the entire end date

      filtered = filtered.filter(apt => {
        const appointmentDate = new Date(apt.bookingDate);
        return appointmentDate >= fromDate && appointmentDate <= toDate;
      });
    }

    // Sort by booking date (newest first)
    filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    setFilteredAppointments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Get status counts for display
  const getStatusCounts = () => {
    const counts = {
      all: appointments.length,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0
    };

    appointments.forEach(apt => {
      if (counts.hasOwnProperty(apt.status)) {
        counts[apt.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  // Get paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // ================================
  // Handlers
  // ================================

  const handleApprove = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'confirmed');
  };

  const handleReject = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'cancelled');
  };

  const handleViewDetail = (appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setDateRange({ from: '', to: '' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  // ================================
  // Render Helpers
  // ================================

  const getStatusColor = (status: AppointmentStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      no_show: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      in_progress: 'Đang thực hiện',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      no_show: 'Không đến'
    };
    return labels[status] || status;
  };

  const renderAppointmentCard = (appointment: AppointmentResponse) => {
    const cardColors = [
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200',
      'bg-pink-50 border-pink-200',
      'bg-purple-50 border-purple-200',
      'bg-yellow-50 border-yellow-200',
      'bg-indigo-50 border-indigo-200'
    ];

    const randomColor = cardColors[Math.floor(Math.random() * cardColors.length)];

    return (
      <div key={appointment._id} className={`${randomColor} border-2 rounded-lg p-4 hover:shadow-md transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold text-sm shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">ID: {appointment._id.slice(-8)}</p>
              <p className="text-xs text-gray-600">User: {appointment.userID?.slice(-8)}</p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
            {getStatusLabel(appointment.status)}
          </span>
        </div>

        {/* Booking Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatDate(appointment.bookingDate)} lúc {formatTime(appointment.bookingDate)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>Tạo: {formatDate(appointment.createdAt)}</span>
          </div>

          {/* Service/Package Info */}
          {appointment.serviceID && (
            <div className="flex items-center text-sm text-gray-600">
              <Wrench className="w-4 h-4 mr-2 text-gray-400" />
              <span>Dịch vụ: {appointment.serviceID.slice(-8)}</span>
            </div>
          )}

          {appointment.servicePackageID && (
            <div className="flex items-center text-sm text-gray-600">
              <Package className="w-4 h-4 mr-2 text-gray-400" />
              <span>Gói: {appointment.servicePackageID.slice(-8)}</span>
            </div>
          )}

          {appointment.vehicleID && (
            <div className="flex items-center text-sm text-gray-600">
              <Car className="w-4 h-4 mr-2 text-gray-400" />
              <span>Xe: {appointment.vehicleID.slice(-8)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleViewDetail(appointment)}
          >
            Chi tiết
          </Button>

          {appointment.status === 'pending' && (
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleApprove(appointment._id)}
              >
                Duyệt
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleReject(appointment._id)}
              >
                Từ chối
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between mt-6">
        {/* Page size selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Hiển thị:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">
            mục ({startIndex + 1}-{Math.min(endIndex, filteredAppointments.length)} của {filteredAppointments.length})
          </span>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            Đầu
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              className={`px-3 py-1 text-sm rounded transition-colors ${page === currentPage
                ? 'bg-orange-500 text-white'
                : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {page}
            </button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Cuối
          </Button>
        </div>
      </div>
    );
  };

  // ================================
  // Render
  // ================================

  const statusCounts = getStatusCounts();

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={fetchAppointments}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {appointments.length} lịch hẹn | Hiển thị {filteredAppointments.length} kết quả
          </p>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {[
          { key: 'all', label: 'Tất cả', color: 'bg-gray-100 text-gray-800' },
          { key: 'pending', label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
          { key: 'confirmed', label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
          { key: 'in_progress', label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800' },
          { key: 'completed', label: 'Hoàn thành', color: 'bg-gray-100 text-gray-800' },
          { key: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
          { key: 'no_show', label: 'Không đến', color: 'bg-purple-100 text-purple-800' }
        ].map((item) => (
          <div
            key={item.key}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedStatus === item.key
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => setSelectedStatus(item.key as AppointmentStatus | 'all')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts[item.key as keyof typeof statusCounts]}
              </div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Bộ lọc</h3>
          {(searchTerm || selectedStatus !== 'all' || dateRange.from || dateRange.to) && (
            <button
              onClick={handleClearAllFilters}
              className="text-sm text-orange-600 hover:text-orange-800 ml-auto"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-5.5 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
              <option value="no_show">Không đến</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <input
                type="date"
                placeholder="Từ ngày"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                title="Từ ngày"
              />

              <input
                type="date"
                placeholder="Đến ngày"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                title="Đến ngày"
              />
            </div>
            {(dateRange.from || dateRange.to) && (
              <div className="text-xs text-gray-500">
                {dateRange.from && dateRange.to
                  ? `Từ ${dateRange.from} đến ${dateRange.to}`
                  : dateRange.from
                    ? `Từ ${dateRange.from} trở đi`
                    : `Đến ${dateRange.to}`
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : paginatedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">Không có lịch hẹn nào</div>
              <p className="text-sm text-gray-400">
                {filteredAppointments.length === 0 && appointments.length > 0
                  ? 'Không có kết quả phù hợp với bộ lọc'
                  : 'Chưa có lịch hẹn nào trong hệ thống'
                }
              </p>
              {filteredAppointments.length === 0 && appointments.length > 0 && (
                <button
                  onClick={handleClearAllFilters}
                  className="mt-2 text-orange-600 hover:text-orange-800 text-sm"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Appointments Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedAppointments.map(renderAppointmentCard)}
              </div>

              {/* Pagination */}
              {renderPagination()}
            </>
          )}
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
        />
      )}
    </div>
  );
};

export default ManageAppointment;