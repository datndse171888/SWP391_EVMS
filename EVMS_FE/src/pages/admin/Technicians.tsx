import React, { useState, useEffect } from 'react'
import { AddUserModal } from '../../components/AddUserModal'
import { UserDetailModal } from '../../components/UserDetailModal'
import { AddCertificateModal } from '../../components/AddCertificateModal'
import { UserApi } from '../../api/UserApi'
import { technicianApi } from '../../api/TechnicianApi'

interface User {
  _id: string
  email: string
  userName: string
  fullName: string
  phoneNumber: string
  photoURL: string
  role: string
  gender: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

interface TechnicianInfo {
  id: string
  introduction: string
  experience: number
  startDate: string
}

interface TechnicianCertificate {
  certificateID: string
  issuedDate: string
  expiryDate: string
  status: string
  note: string
  certificateImage: string
}

export const Technicians: React.FC = () => {
  const [technicians, setTechnicians] = useState<User[]>([])
  const [technicianDetails, setTechnicianDetails] = useState<{[key: string]: TechnicianInfo}>({})
  const [certificates, setCertificates] = useState<{[key: string]: TechnicianCertificate[]}>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedTechnicianForCertificate, setSelectedTechnicianForCertificate] = useState<{ id: string; name: string } | null>(null)

  const limit = 10

  useEffect(() => {
    fetchTechnicians()
  }, [currentPage, searchTerm, statusFilter])

  const fetchTechnicians = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchTerm,
        role: 'technician'
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`http://localhost:4000/api/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setTechnicians(data.data.users)
        setTotalPages(data.data.pagination.totalPages)
        
        // Fetch technician details for each technician (in parallel for better performance)
        const detailPromises = data.data.users.map((technician: User) => 
          fetchTechnicianDetails(technician._id)
        )
        await Promise.all(detailPromises)
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kỹ thuật viên:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicianDetails = async (userId: string) => {
    try {
      // Fetch technician info using authenticated API
      try {
        const techResponse = await technicianApi.getTechnicianInfo(userId)
        if (techResponse.data?.success && techResponse.data.data?.technician) {
          const technicianInfo = techResponse.data.data.technician
          console.log(`Technician ${userId} info:`, technicianInfo)
          setTechnicianDetails(prev => ({
            ...prev,
            [userId]: technicianInfo
          }))
        } else {
          console.warn(`Technician ${userId}: API response không có data`, techResponse.data)
        }
      } catch (error: any) {
        console.warn(`Technician ${userId}: Lỗi khi lấy thông tin`, error?.response?.status || error)
      }

      // Fetch certificates using authenticated API
      try {
        const certResponse = await technicianApi.getTechnicianCertificates(userId)
        if (certResponse.data?.success) {
          setCertificates(prev => ({
            ...prev,
            [userId]: certResponse.data.data?.certificates || []
          }))
        }
      } catch (error: any) {
        console.warn(`Technician ${userId}: Lỗi khi lấy chứng chỉ`, error?.response?.status || error)
      }
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin kỹ thuật viên ${userId}:`, error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchTechnicians()
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setShowDetailModal(true)
  }

  const handleAddSuccess = () => {
    fetchTechnicians()
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await UserApi.enableUser(userId)
      } else {
        await UserApi.disableUser(userId)
      }
      // Refresh the list
      fetchTechnicians()
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái:', error)
      alert('Không thể thay đổi trạng thái. Vui lòng thử lại.')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'Active': 'bg-green-100 text-green-800',
      'Expired': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Revoked': 'bg-gray-100 text-gray-800'
    }
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Kỹ thuật viên</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-0 text-white px-6 py-2 rounded-lg hover:bg-azure-0 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Thêm kỹ thuật viên
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-0 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="disabled">Vô hiệu hóa</option>
              </select>
            </div>
            <button
              type="submit"
            className="bg-blue-0 text-white px-6 py-3 rounded-xl hover:bg-azure-0 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Technicians Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azure-0"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Kỹ thuật viên</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Kinh nghiệm</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Chứng chỉ</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Trạng thái</th>
                      <th className="text-left py-4 px-6 text-gray-600 font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {technicians.map((technician) => {
                      const details = technicianDetails[technician._id]
                      const techCertificates = certificates[technician._id] || []
                      
                      return (
                        <tr key={technician._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-0 flex items-center justify-center shadow-md">
                                {technician.photoURL ? (
                                  <img
                                    src={technician.photoURL}
                                    alt={technician.fullName}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-bold text-lg">
                                    {technician.fullName.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{technician.fullName}</div>
                                <div className="text-sm text-gray-500">{technician.email}</div>
                                <div className="text-sm text-gray-500">{technician.phoneNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {details ? (
                              <div className="font-medium text-gray-800">
                                {details.experience !== undefined && details.experience !== null 
                                  ? `${details.experience} năm` 
                                  : 'Chưa có thông tin'}
                              </div>
                            ) : (
                              <span className="text-gray-400">Chưa có thông tin</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1">
                              {techCertificates.map((cert, index) => (
                                <span
                                  key={index}
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(cert.status)}`}
                                >
                                  {cert.status}
                                </span>
                              ))}
                              {techCertificates.length === 0 && (
                                <span className="text-gray-400 text-sm">Chưa có chứng chỉ</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-sm font-medium ${
                              technician.isDisabled 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {technician.isDisabled ? 'Vô hiệu hóa' : 'Hoạt động'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleViewDetails(technician)}
                                className="px-4 py-2 rounded-lg border border-blue-0 text-blue-0 hover:bg-blue-0 hover:text-white transition-all duration-200 shadow-sm hover:shadow text-sm"
                              >
                                Xem chi tiết
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTechnicianForCertificate({
                                    id: technician._id,
                                    name: technician.fullName
                                  })
                                  setShowCertificateModal(true)
                                }}
                                className="px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow text-sm"
                              >
                                Thêm chứng chỉ
                              </button>
                              <button
                                onClick={() => handleToggleStatus(technician._id, technician.isDisabled)}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow text-sm ${
                                  technician.isDisabled
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                                }`}
                              >
                                {technician.isDisabled ? 'Kích hoạt' : 'Vô hiệu hóa'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Trang {currentPage} / {totalPages}
                  </div>
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
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        defaultRole="technician"
        allowedRoles={['technician']}
      />

      {selectedUser && (
        <UserDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
        />
      )}

      {selectedTechnicianForCertificate && (
        <AddCertificateModal
          isOpen={showCertificateModal}
          onClose={() => {
            setShowCertificateModal(false)
            setSelectedTechnicianForCertificate(null)
          }}
          onSuccess={() => {
            // Refresh certificates for the technician
            if (selectedTechnicianForCertificate) {
              fetchTechnicianDetails(selectedTechnicianForCertificate.id)
            }
          }}
          technicianId={selectedTechnicianForCertificate.id}
          technicianName={selectedTechnicianForCertificate.name}
        />
      )}
    </div>
  )
}

export default Technicians
