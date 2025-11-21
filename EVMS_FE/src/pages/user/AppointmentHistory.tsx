// src/pages/user/AppointmentHistory.tsx - Updated with new layout and components
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppointmentApi } from "../../api/AppointmentApi";
import type { FilteredDataResponse } from "../../types/DataResponse";
import type { AppointmentResponse, AppointmentStatus } from "../../types/Appoitment";
import { AppointmentCard } from "../../components/ui/AppointmentCard";
import AppointmentDetailModal from "../../components/ui/AppointmentDetailModal";
import { Loading } from "../../components/Loading";
import { useAlert } from "../../hooks/useAlert";
import { UserProfileLayout } from "../../components/layout/UserProfileLayout";
import { UserProfileSidebar } from "../../components/layout/UserProfileSidebar";
import { UserProfileHeader } from "../../components/layout/UserProfileHeader";
import { Filter, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";

const AppointmentHistory = () => {
  // ===================================
  // States & Variables
  // ===================================

  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { showAlert, AlertComponent } = useAlert();

  // Filter states
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);


  // ===================================
  // Effects
  // ===================================

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, searchTerm, selectedStatus, dateRange]);


  // ===================================
  // Fetch Data
  // ===================================

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch appointments sorted by creation date (newest first)
      const appointmentResponse = await AppointmentApi.getAppointmentByMeSorted();
      const appointmentData: FilteredDataResponse<AppointmentResponse> = appointmentResponse.data;
      setAppointments(appointmentData.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      showAlert('error', 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // Handlers
  // ===================================

  const handleViewDetail = (appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };


  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setDateRange({ from: '', to: '' });
  };

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

    // Sort by creation date (newest created first - mới đặt lịch hiển thị đầu tiên)
    filtered.sort((a, b) => {
      // If createdAt exists, use it for sorting
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Fallback to bookingDate if createdAt is missing
      return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
    });

    setFilteredAppointments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination handler
  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  // ===================================
  // Render
  // ===================================

  // Get paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Render pagination
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

  return (
    <UserProfileLayout>
      {AlertComponent}

      <div className="flex flex-row w-full h-full">
        <UserProfileSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="w-full px-8 py-8 flex flex-col h-full">
            <div className="flex-shrink-0">
            <UserProfileHeader
              title="Lịch hẹn của bạn"
              description="Quản lý và theo dõi các lịch hẹn dịch vụ"
            />

            {/* Advanced Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
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
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="py-12">
                <Loading />
                <p className="text-center text-gray-500 mt-4">Đang tải danh sách lịch hẹn...</p>
              </div>
            ) : paginatedAppointments.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500 text-lg mb-4">Bạn chưa có lịch hẹn nào</p>
                <button
                  onClick={() => navigate("/booking")}
                  className="px-6 py-3 text-white rounded-lg transition-colors font-medium hover:opacity-90"
                  style={{ backgroundColor: '#f6ae2d', color: '#014091' }}
                >
                  Đặt lịch ngay
                </button>
              </div>
            ) : (
                <div className="pb-96">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      handleViewDetail={handleViewDetail}
                      variant="user"
                    />
                  ))}
                </div>

                {/* Pagination */}
                  <div className="mt-6">
                {renderPagination()}
                  </div>
              </div>
            )}
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
          varient="user"
        />
      )}
    </UserProfileLayout>
  );
};

export default AppointmentHistory;