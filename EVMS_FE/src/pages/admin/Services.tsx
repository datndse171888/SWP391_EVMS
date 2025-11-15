import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchServices } from '../../api/ServiceApi'
import { ServiceApi } from '../../api/ServiceApi'
import { ServiceModal } from '../../components/ServiceModal'
import type { ServiceResponse } from '../../types/Service'

interface ServicesResponsePagination {
  currentPage: number
  totalPages: number
  totalItems?: number
  limit: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const limit = 10
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedService, setSelectedService] = useState<ServiceResponse | null>(null);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }), [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchServices({ 
        page: currentPage, 
        limit, 
        search: searchTerm,
        vehicleCategory: selectedVehicleType || undefined
      })
      if (res?.success) {
        const serviceList = res.data.services || [];
        // Log để debug
        console.log(`Page ${currentPage}: Loaded ${serviceList.length} services, Total: ${res.data.pagination?.totalItems || 0}`);
        console.log('Service IDs:', serviceList.map(s => s._id));
        
        // Kiểm tra duplicate
        const ids = serviceList.map(s => s._id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
          console.warn('Duplicate services detected!', ids.filter((id, idx) => ids.indexOf(id) !== idx));
        }
        
        setServices(serviceList);
        const pagination: ServicesResponsePagination = res.data.pagination
        setTotalPages(pagination?.totalPages || 1)
      } else {
        setServices([])
        setTotalPages(1)
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách dịch vụ:', err)
      setServices([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [currentPage, limit, searchTerm, selectedVehicleType])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleVehicleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVehicleType(e.target.value)
    setCurrentPage(1) // Reset về trang 1 khi thay đổi filter
  }

  const truncate = (text?: string, maxLen: number = 120) => {
    if (!text) return '—'
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen).trimEnd() + '...'
  }

  const getAvatarFallback = (name?: string) => {
    if (!name || name.length === 0) return 'S'
    return name.charAt(0).toUpperCase()
  }


  const handleCreate = () => {
    setModalMode('create');
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: ServiceResponse) => {
    setModalMode('edit');
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSave = async (serviceData: Partial<ServiceResponse>) => {
    if (modalMode === 'create') {
      try {
        // Call API to create service
        const response = await ServiceApi.createService(serviceData as ServiceResponse);

        if (!response.status) {
          throw new Error('Failed to create service');
        }

        loadData();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error creating service:', error);
        alert('Failed to create service. Please try again.');
      }
    } else {
      try {
        // Call API to update service
        const response = await ServiceApi.updateService(serviceData._id!, serviceData);

        if (!response.status) {
          throw new Error('Failed to update service');
        }

        loadData();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error updating service:', error);
        alert('Failed to update service. Please try again.');
      }
    }


  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${name}"?`)) {
      return;
    }

    try {

      const response = await ServiceApi.deleteService(id);

      if (!response.status) {
        throw new Error('Failed to delete service');
      }

      loadData();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    }
  };



  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý dịch vụ</h1>
            <p className="text-gray-600 mt-1">Xem danh sách dịch vụ trong hệ thống</p>
          </div>
          <button
            onClick={() => (handleCreate())}
            className="bg-blue-0 text-white px-6 py-2 rounded-lg hover:bg-azure-0 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Thêm dịch vụ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo tên dịch vụ..."
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
                value={selectedVehicleType}
                onChange={handleVehicleTypeChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-0 focus:border-transparent bg-white"
              >
                 <option value="">Tất cả loại xe</option>
                <option value="BICYCLE">Xe đạp điện</option>
                <option value="MOTOBIKE">Xe máy điện</option>
                <option value="CAR">Xe ô tô điện</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-0 text-white px-6 py-3 rounded-xl hover:bg-azure-0 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Tìm kiếm
            </button>
          </form>
        </div>



        {/* Services Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azure-0"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-gray-600">Không có dịch vụ phù hợp</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Dịch vụ</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Giá</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Thời lượng</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Loại xe</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Hành động</th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {services.map((svc, index) => {
                      // Ensure unique key - use _id with index as fallback
                      const uniqueKey = svc._id || `service-${index}-${svc.name}`;
                      return (
                      <tr key={uniqueKey} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-0 flex items-center justify-center shadow-md overflow-hidden">
                              {svc.image ? (
                                <img
                                  src={svc.image}
                                  alt={svc.name}
                                  className="w-12 h-12 object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <span className="text-white font-bold text-lg">{getAvatarFallback(svc.name)}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{svc.name || '—'}</div>
                              <div className="text-sm text-gray-500 max-w-xl">{truncate(svc.description, 140)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {typeof svc.price === 'number' ? currencyFormatter.format(svc.price) : '—'}
                        </td>
                        <td className="py-4 px-6">{svc.duration || '—'}</td>

                        <td className="py-4 px-6">
                          {svc.vehicleCategory === 'BICYCLE' && 'Xe đạp điện'}
                          {svc.vehicleCategory === 'MOTOBIKE' && 'Xe máy điện'}
                          {svc.vehicleCategory === 'CAR' && 'Xe ô tô điện'}
                          {!svc.vehicleCategory && '—'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => {
                                console.log('Edit service', svc);
                                handleEdit(svc)
                              }}
                              className="p-2.5 bg-blue-0/10 text-blue-0 hover:bg-blue-0 hover:text-white rounded-lg transition-all duration-200 border border-blue-0/20 hover:border-blue-0"
                              title="Chỉnh sửa"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(svc._id, svc.name)}
                              className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 border border-red-200 hover:border-red-600"
                              title="Xóa"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">Trang {currentPage} / {totalPages}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        service={selectedService}
        mode={modalMode}
      />
    </div>
  )
}

export default Services


