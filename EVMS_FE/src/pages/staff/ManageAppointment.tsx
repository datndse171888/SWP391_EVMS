// src/pages/staff/ManageAppointment.tsx - Updated with filters and pagination
import React, { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { AppointmentResponse, AppointmentStatus } from '../../types/Appoitment';
import { AppointmentApi } from '../../api/AppointmentApi';
import AppointmentDetailModal from './../../components/ui/AppointmentDetailModal';
import type { FilteredDataResponse } from '../../types/DataResponse';
import { AppointmentCard } from '../../components/ui/AppointmentCard';
import { useAlert } from '../../hooks/useAlert';

const ManageAppointment: React.FC = () => {
  // ================================
  // States
  // ================================

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { showAlert, AlertComponent } = useAlert();

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

    try {
      const response = await AppointmentApi.getAllAppointments();
      const appointmentData: FilteredDataResponse<AppointmentResponse> = response.data;

      if (Array.isArray(appointmentData.data)) {
        setAppointments(appointmentData.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
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
    try {
      await AppointmentApi.updateAppointmentStatus(appointmentId, { status: 'confirmed' });
      showAlert('success', 'Lịch hẹn đã nhận thành công');
      fetchAppointments();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      showAlert('error', 'Không thể nhận lịch hẹn');
    }
  };

  const handleReject = async (appointmentId: string) => {
    try {
      await AppointmentApi.cancelAppointment(appointmentId);
      showAlert('success', 'Lịch hẹn đã được hủy thành công');
      fetchAppointments();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      showAlert('error', 'Không thể hủy lịch hẹn');
    }
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

  return (
    <div className="p-6 space-y-6">
      {AlertComponent}
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
                {paginatedAppointments.map(
                  appointment => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      handleViewDetail={handleViewDetail}
                      handleApprove={handleApprove}
                      handleReject={handleReject}
                    />
                  ))}
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
          varient="staff"
        />
      )}
    </div>
  );
};

export default ManageAppointment;