import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import type { ServicePackageResponse } from '../../types/ServicePackage';
import type { VehicleCategory } from '../../types/Vehicle';
import { ServicePackageModal } from '../../components/ServicePackageModal';
import { api } from '../../utils/Axios';
import { useAlert } from '../../hooks/useAlert';

const ServicePackages = () => {
  const { showAlert, AlertComponent } = useAlert();
  const [packages, setPackages] = useState<ServicePackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<VehicleCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'active' | 'inactive'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPackage, setSelectedPackage] = useState<ServicePackageResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [currentPage, filterCategory, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (filterCategory !== 'ALL') {
        params.vehicleCategory = filterCategory;
      }

      if (filterStatus !== 'ALL') {
        params.status = filterStatus;
      }

      const response = await api.get('/service-packages', { params });
      setPackages(response.data.items || []);
      setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error loading packages:', error);
      showAlert('error', 'Không thể tải dữ liệu gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedPackage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pkg: ServicePackageResponse) => {
    setModalMode('edit');
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleSave = async (packageData: Partial<ServicePackageResponse>) => {
    try {
      if (modalMode === 'create') {
        await api.post('/service-packages', packageData);
        showAlert('success', 'Tạo gói dịch vụ thành công!');
      } else {
        await api.put(`/service-packages/${packageData._id}`, packageData);
        showAlert('success', 'Cập nhật gói dịch vụ thành công!');
      }

      loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving package:', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      showAlert('error', message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa gói dịch vụ này?')) return;

    try {
      await api.delete(`/service-packages/${id}`);
      showAlert('success', 'Xóa gói dịch vụ thành công!');
      loadData();
    } catch (error: any) {
      console.error('Error deleting package:', error);
      const message = error.response?.data?.message || 'Không thể xóa gói dịch vụ';
      showAlert('error', message);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const getCategoryBadge = (category: VehicleCategory) => {
    const badges = {
      CAR: 'Xe ô tô điện',
      BICYCLE: 'Xe đạp điện',
      MOTOBIKE: 'Xe máy điện',
    };
    return <span className="text-gray-700">{badges[category]}</span>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Hoạt động</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">Tạm dừng</span>;
  };

  if (loading && packages.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý gói dịch vụ</h1>
            <p className="text-gray-600 mt-1">Quản lý các gói dịch vụ combo với giá ưu đãi</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-0 text-white px-6 py-2 rounded-lg hover:bg-azure-0 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Thêm gói dịch vụ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm gói dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-0 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-0 focus:border-transparent bg-white"
              >
                <option value="ALL">Tất cả loại xe</option>
                <option value="CAR">Xe ô tô điện</option>
                <option value="BICYCLE">Xe đạp điện</option>
                <option value="MOTOBIKE">Xe máy điện</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-0 focus:border-transparent bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azure-0"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-gray-600">
                {searchTerm ? `Không tìm thấy gói dịch vụ với từ khóa "${searchTerm}"` : 'Chưa có gói dịch vụ nào'}
              </span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Tên gói</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Loại xe</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Số DV</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Giá gốc</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Giảm giá</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Giá cuối</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Thời gian</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Định kỳ</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Trạng thái</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPackages.map((pkg, index) => {
                      const serviceCount = Array.isArray(pkg.services) ? pkg.services.length : 0;
                      const discountedPrice = pkg.price * (1 - (pkg.discount || 0) / 100);

                      return (
                        <tr key={pkg._id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{pkg.name}</div>
                            {pkg.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{pkg.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">{getCategoryBadge(pkg.vehicleCategory)}</td>
                          <td className="px-6 py-4">
                            <span className="text-gray-700">{serviceCount}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 line-through text-sm">
                            {pkg.price.toLocaleString('vi-VN')}₫
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-red-600 font-medium text-sm">
                              -{pkg.discount || 0}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900">
                              {discountedPrice.toLocaleString('vi-VN')}₫
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{pkg.duration}p</td>
                          <td className="px-6 py-4">
                            {pkg.periodicEnabled ? (
                              <span className="text-xs text-gray-600">
                                {pkg.intervalMonths}T x {pkg.defaultTotalVisits}L
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(pkg.status)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(pkg)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Chỉnh sửa"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(pkg._id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Xóa"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      <ServicePackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        package={selectedPackage}
        mode={modalMode}
      />

      {/* Alert Component */}
      {AlertComponent}
    </div>
  );
};

export default ServicePackages;