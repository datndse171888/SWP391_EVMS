import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { Service } from '../../types/Service'
import { fetchServices } from '../../api/ServiceApi'

interface ServicesResponsePagination {
  currentPage: number
  totalPages: number
  totalItems?: number
  limit: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const limit = 10

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }), [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchServices({ page: currentPage, limit, search: searchTerm })
      if (res?.success) {
        setServices(res.data.services || [])
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
  }, [currentPage, limit, searchTerm])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadData()
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

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý dịch vụ</h1>
            <p className="text-gray-600 mt-1">Xem danh sách dịch vụ trong hệ thống</p>
          </div>
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
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {services.map((svc) => (
                      <tr key={svc.id} className="hover:bg-gray-50 transition-colors duration-200">
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
                          {svc.vehicleType === 'electric_bike' && 'Xe đạp điện'}
                          {svc.vehicleType === 'electric_motorcycle' && 'Xe máy điện'}
                          {svc.vehicleType === 'electric_car' && 'Xe ô tô điện'}
                          {!svc.vehicleType && '—'}
                        </td>
                      </tr>
                    ))}
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
    </div>
  )
}

export default Services


