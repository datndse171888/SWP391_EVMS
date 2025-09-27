import React, { useState, useEffect } from 'react'

// Interface cho User
interface User {
  _id: string;
  userName: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  role: string;
  isDisabled: boolean;
}

// Component cho các thẻ thống kê
const StatCard: React.FC<{
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: string
  linkText: string
  accentColor: string
}> = ({ title, value, change, changeType, icon, linkText, accentColor }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl ${accentColor} flex items-center justify-center shadow-md`}>
          <span className="text-white text-2xl">{icon}</span>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">{value}</div>
          <div className={`text-sm font-semibold ${changeType === 'positive' ? 'text-emerald-600' : 'text-red-500'}`}>
            {change}
          </div>
        </div>
      </div>
      <div className="text-gray-600 text-sm font-medium mb-2">{title}</div>
      <a href="#" className="text-blue-500 text-sm font-medium hover:underline">{linkText}</a>
    </div>
  )
}

// Component cho bảng users
const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.data.users)
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Người dùng gần đây</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-4 px-4 text-gray-600 font-semibold">Người dùng</th>
              <th className="text-left py-4 px-4 text-gray-600 font-semibold">Vai trò</th>
              <th className="text-left py-4 px-4 text-gray-600 font-semibold">Trạng thái</th>
              <th className="text-left py-4 px-4 text-gray-600 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 5).map((user) => (
              <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-200">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {user.fullName || user.userName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'technician' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    user.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isDisabled ? 'Vô hiệu hóa' : 'Hoạt động'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <a href="/admin/users" className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                    Xem tất cả
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Chào mừng bạn đến với hệ thống quản lý sự kiện EVMS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng sự kiện"
          value="24"
          change="+12%"
          changeType="positive"
          icon="📅"
          linkText="Xem tất cả sự kiện"
          accentColor="bg-gradient-to-br from-blue-400 to-blue-500"
        />
        <StatCard
          title="Người dùng"
          value="1,234"
          change="+8%"
          changeType="positive"
          icon="👥"
          linkText="Quản lý người dùng"
          accentColor="bg-gradient-to-br from-green-400 to-green-500"
        />
        <StatCard
          title="Kỹ thuật viên"
          value="45"
          change="+3%"
          changeType="positive"
          icon="🔧"
          linkText="Quản lý kỹ thuật viên"
          accentColor="bg-gradient-to-br from-purple-400 to-purple-500"
        />
        <StatCard
          title="Doanh thu"
          value="₫12.5M"
          change="-2%"
          changeType="negative"
          icon="💰"
          linkText="Xem báo cáo"
          accentColor="bg-gradient-to-br from-orange-400 to-orange-500"
        />
      </div>

      {/* Users Table */}
      <UsersTable />
    </div>
  )
}

export default Dashboard
