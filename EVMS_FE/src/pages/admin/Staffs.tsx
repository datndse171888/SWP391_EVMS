import React, { useState, useEffect, useCallback } from 'react'
import AddUserModal from '../../components/AddUserModal'
import UserDetailModal from '../../components/UserDetailModal'
import { UserApi } from '../../api/UserApi'

interface User {
  _id: string
  userName: string
  email: string
  fullName?: string
  phoneNumber?: string
  photoURL?: string
  role?: string
  gender?: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

interface UsersResponse {
  success: boolean
  data: {
    users: User[]
    pagination: {
      currentPage: number
      totalPages: number
      totalUsers: number
      limit: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

export const Staffs: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const limit = 10

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString()
      })
      
      const response = await fetch(`http://localhost:4000/api/users?${params}`)
      const data: UsersResponse = await response.json()
      
      if (data.success) {
        // Filter only staff users
        let filteredUsers = data.data.users.filter(user => user.role === 'staff')
        
        // Filter by search term
        if (searchTerm) {
          filteredUsers = filteredUsers.filter(user => 
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        
        setUsers(filteredUsers)
        setTotalPages(Math.ceil(filteredUsers.length / limit))
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, limit])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setShowDetailModal(true)
  }

  const handleAddSuccess = () => {
    setShowAddModal(false)
    fetchUsers()
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await UserApi.enableUser(userId)
      } else {
        await UserApi.disableUser(userId)
      }
      // Refresh the list
      fetchUsers()
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái:', error)
      alert('Không thể thay đổi trạng thái. Vui lòng thử lại.')
    }
  }

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: string } = {
      'customer': 'bg-gray-100 text-gray-800',
      'admin': 'bg-purple-100 text-purple-800',
      'staff': 'bg-blue-100 text-blue-800',
      'technician': 'bg-green-100 text-green-800',
    }
    return badges[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <main>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-0 mb-2">Nhân viên</h1>
          <p className="text-gray-600">Quản lý danh sách nhân viên</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {/* Search and Add Button */}
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-0 focus:border-blue-0"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-blue-0 text-white rounded-lg hover:bg-azure-0 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm nhân viên
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-0"></div>
              <p className="mt-2 text-gray-500">Đang tải...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Người dùng</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Số điện thoại</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Vai trò</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Trạng thái</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.fullName || user.userName}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-0 flex items-center justify-center text-white font-semibold mr-3">
                                {(user.fullName || user.userName || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.fullName || user.userName}</div>
                              <div className="text-sm text-gray-500">@{user.userName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">{user.email}</td>
                        <td className="py-4 px-6 text-sm text-gray-900">{user.phoneNumber || '—'}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(user.role || '')}`}>
                            {user.role === 'staff' ? 'Nhân viên' : user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-sm font-medium ${
                            user.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.isDisabled ? 'Vô hiệu hóa' : 'Hoạt động'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(user)}
                              className="px-4 py-2 rounded-lg border border-blue-0 text-blue-0 hover:bg-blue-0 hover:text-white transition-all duration-200 shadow-sm hover:shadow text-sm"
                            >
                              Xem chi tiết
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user._id, user.isDisabled)}
                              className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow text-sm ${
                                user.isDisabled
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                              }`}
                            >
                              {user.isDisabled ? 'Kích hoạt' : 'Vô hiệu hóa'}
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
      </main>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        defaultRole="staff"
        allowedRoles={['staff']}
      />

      <UserDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        user={selectedUser}
      />
    </div>
  )
}

export default Staffs

