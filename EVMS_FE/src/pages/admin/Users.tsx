import React, { useState, useEffect, useCallback } from 'react'
import AddUserModal from '../../components/AddUserModal'
import UserDetailModal from '../../components/UserDetailModal'

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

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
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
        let filteredUsers = data.data.users
        
        // Filter by search term
        if (searchTerm) {
          filteredUsers = filteredUsers.filter(user => 
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        
        // Filter by role
        if (roleFilter !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.role === roleFilter)
        }
        
        setUsers(filteredUsers)
        setTotalPages(data.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách users:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, roleFilter, limit])

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
    fetchUsers()
  }

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'admin': 'bg-purple-100 text-purple-800',
      'staff': 'bg-blue-100 text-blue-800',
      'technician': 'bg-green-100 text-green-800',
      'customer': 'bg-gray-100 text-gray-800'
    }
    return roleMap[role as keyof typeof roleMap] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h1>
              <p className="text-gray-600 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Thêm người dùng
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
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-0 focus:border-transparent"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="technician">Technician</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <button
                type="submit"
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* Users Table */}
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
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Người dùng</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Vai trò</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Trạng thái</th>
                        <th className="text-left py-4 px-6 text-gray-600 font-semibold">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-blue-0 flex items-center justify-center shadow-md">
                                {user.photoURL ? (
                                  <img
                                    src={user.photoURL}
                                    alt={user.fullName || user.userName}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-bold text-lg">
                                    {(user.fullName || user.userName).charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {user.fullName || user.userName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(user.role || '')}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              user.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.isDisabled ? 'Vô hiệu hóa' : 'Hoạt động'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleViewDetails(user)}
                              className="px-4 py-2 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-200 shadow-sm hover:shadow text-sm"
                            >
                              Xem chi tiết
                            </button>
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
      />

      <UserDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        user={selectedUser}
      />
    </div>
  )
}

export default Users
