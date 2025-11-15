import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { Part } from '../../types/Part'
import { fetchParts, PartApi } from '../../api/PartApi'
import PartModal from '../../components/PartsModal'
import { InventoryApi } from '../../api/Inventory'
import type { InventoryItemResponse } from '../../api/Inventory'

export const Parts: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([])
  const [inventories, setInventories] = useState<Record<string, InventoryItemResponse>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const limit = 10
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('')
  const [editingQuantity, setEditingQuantity] = useState<{ partId: string; quantity: number } | null>(null)



  const currencyFormatter = useMemo(() => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }), [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchParts({ page: currentPage, limit, search: searchTerm })
      if (res?.success) {
        const partsData = res.data.parts || []
        setParts(partsData)
        setTotalPages(res.data.pagination?.totalPages || 1)
        
        // Load inventory data for all parts
        try {
          const inventoryRes = await InventoryApi.getWithParts({})
          const inventoryMap: Record<string, InventoryItemResponse> = {}
          inventoryRes.items.forEach((item) => {
            if (item.partID && typeof item.partID === 'object' && '_id' in item.partID) {
              inventoryMap[item.partID._id] = item
            }
          })
          setInventories(inventoryMap)
        } catch (invErr) {
          console.error('Lỗi khi tải thông tin tồn kho:', invErr)
        }
      } else {
        setParts([])
        setTotalPages(1)
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách phụ tùng:', err)
      setParts([])
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

  const handleCreate = () => {
    setModalMode('create');
    setSelectedPart(null);
    setIsModalOpen(true);
  };

  const handleEdit = (part: Part) => {
    setModalMode('edit');
    setSelectedPart(part);
    setIsModalOpen(true);
  };

  const handleSave = async (partData: Partial<Part>) => {
    if (modalMode === 'create') {
      try {
        // Call API to create part
        const response = await PartApi.createPart(partData as Part);

        if (!response.status) {
          throw new Error('Failed to create part');
        }

        loadData();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error creating part:', error);
        alert('Failed to create part. Please try again.');
      }
    } else {
      try {
        // Call API to update part
        const response = await PartApi.updatePart(partData._id!, partData as Part);

        if (!response.status) {
          throw new Error('Failed to update part');
        }

        loadData();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error updating part:', error);
        alert('Failed to update part. Please try again.');
      }
    }
  };
  const handleDelete = async (id: string) => {
    try {
      // Call API to delete part
      const response = await PartApi.deletePart(id);
      if (!response.status) {
        throw new Error('Failed to delete part');
      }
      loadData();
    } catch (error) {
      console.error('Error deleting part:', error);
      alert('Failed to delete part. Please try again.');
    }
  };

  const handleUpdateQuantity = async (partId: string, newQuantity: number) => {
    try {
      const inventory = inventories[partId]
      
      let response
      if (inventory) {
        // Update existing inventory
        response = await InventoryApi.updateQuantity(inventory._id, newQuantity)
      } else {
        // Create new inventory if doesn't exist
        response = await InventoryApi.createOrUpdateInventory(partId, newQuantity)
      }

      if (response.data) {
        // Reload inventory data
        const inventoryRes = await InventoryApi.getWithParts({})
        const inventoryMap: Record<string, InventoryItemResponse> = {}
        inventoryRes.items.forEach((item) => {
          if (item.partID && typeof item.partID === 'object' && '_id' in item.partID) {
            inventoryMap[item.partID._id] = item
          }
        })
        setInventories(inventoryMap)
        setEditingQuantity(null)
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error)
      alert(error?.response?.data?.message || 'Lỗi khi cập nhật số lượng. Vui lòng thử lại.')
    }
  }

  const getInventoryStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInventoryStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'Còn hàng'
      case 'low_stock':
        return 'Sắp hết'
      case 'out_of_stock':
        return 'Hết hàng'
      default:
        return 'Chưa có'
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Kho phụ tùng</h1>
            <p className="text-gray-600 mt-1">Xem tất cả phụ tùng trong hệ thống</p>
          </div>
          <button
            onClick={() => (handleCreate())}
            className="bg-blue-0 text-white px-6 py-2 rounded-lg hover:bg-azure-0 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Thêm phụ tùng
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
                  placeholder="Tìm theo tên, mã phụ tùng..."
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
                onChange={(e) => setSelectedVehicleType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-0 focus:border-transparent bg-white"
              >
                <option value="">Tất cả loại xe</option>
                <option value="electric_bike">Xe đạp điện</option>
                <option value="electric_motorcycle">Xe máy điện</option>
                <option value="electric_car">Xe ô tô điện</option>
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

        {/* Parts Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azure-0"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : parts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-gray-600">Không có phụ tùng phù hợp</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Tên phụ tùng</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Mã phụ tùng</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Hãng</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Giá</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Bảo hành</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Số lượng</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Trạng thái</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parts.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-800">{p.name}</div>
                          <div className="text-sm text-gray-500 max-w-xl line-clamp-2">{p.description || '—'}</div>
                        </td>
                        <td className="py-4 px-6">{p.partNumber || '—'}</td>
                        <td className="py-4 px-6">{p.manufacturer || '—'}</td>
                        <td className="py-4 px-6">{typeof p.price === 'number' ? currencyFormatter.format(p.price) : '—'}</td>
                        <td className="py-4 px-6">{p.warrantyPeriod ? `${p.warrantyPeriod} ${p.warrantyCondition || ''}`.trim() : '—'}</td>
                        <td className="py-4 px-6">
                          {editingQuantity?.partId === p._id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={editingQuantity.quantity}
                                onChange={(e) => setEditingQuantity({ partId: p._id, quantity: parseInt(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateQuantity(p._id, editingQuantity.quantity)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Lưu"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setEditingQuantity(null)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Hủy"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">
                                {inventories[p._id]?.quantity ?? 0}
                              </span>
                              <button
                                onClick={() => setEditingQuantity({ partId: p._id, quantity: inventories[p._id]?.quantity ?? 0 })}
                                className="p-1 text-blue-0 hover:text-azure-0"
                                title="Chỉnh sửa số lượng"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          )}
                          {inventories[p._id] && (
                            <div className="mt-1">
                              <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-medium ${getInventoryStatusBadge(inventories[p._id].status)}`}>
                                {getInventoryStatusText(inventories[p._id].status)}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-sm font-medium ${p.status === 'active' ? 'bg-green-100 text-green-800' :
                            p.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {p.status === 'active' ? 'Hoạt động' : p.status === 'inactive' ? 'Tạm dừng' : 'Ẩn'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => {
                                console.log('Edit service', p);
                                handleEdit(p)
                              }}
                              className="p-2.5 bg-blue-0/10 text-blue-0 hover:bg-blue-0 hover:text-white rounded-lg transition-all duration-200 border border-blue-0/20 hover:border-blue-0"
                              title="Chỉnh sửa"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
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
      <PartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        part={selectedPart}
        mode={modalMode}
      />
    </div>
  )
}

export default Parts


