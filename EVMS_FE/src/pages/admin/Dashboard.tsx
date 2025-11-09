import React, { useState, useEffect } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)


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
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${accentColor} flex items-center justify-center shadow-md border-2 border-white`}>
            <span className="text-white text-2xl">{icon}</span>
          </div>
          <div>
            <div className="text-gray-600 text-sm font-medium">{title}</div>
            <a href="#" className="text-azure-0 text-xs font-semibold hover:underline">{linkText}</a>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">{value}</div>
          <div className={`text-xs font-semibold ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </div>
        </div>
      </div>
      <div className="w-full h-1 rounded bg-gray-100 overflow-hidden">
        <div className={`${accentColor} h-full`} style={{ width: '60%' }}></div>
      </div>
    </div>
  )
}

// Component cho bảng users
const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setError(null)
      const response = await fetch('http://localhost:4000/api/users?limit=5&page=1')
      const data = await response.json()
      if (data.success) {
        setUsers(data.data.users || [])
      } else {
        setError('Không thể tải danh sách người dùng')
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách users:', error)
      setError('Lỗi kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  const roleLabels: Record<string, string> = {
    'admin': 'Quản trị viên',
    'staff': 'Nhân viên',
    'technician': 'Kỹ thuật viên',
    'customer': 'Khách hàng'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-0"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-0 text-white rounded-lg hover:opacity-90 transition"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>Chưa có người dùng nào</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">Người dùng</th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">Vai trò</th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 5).map((user) => (
              <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {user.fullName || user.userName}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'technician' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {roleLabels[user.role] || user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    user.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${user.isDisabled ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    {user.isDisabled ? 'Vô hiệu hóa' : 'Hoạt động'}
                  </span>
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
  const [users, setUsers] = useState<User[]>([])
  const [usersByRole, setUsersByRole] = useState<Record<string, number>>({})
  const [usersByStatus, setUsersByStatus] = useState<{ active: number; disabled: number }>({ active: 0, disabled: 0 })
  const [servicesCount, setServicesCount] = useState<Record<string, number>>({})
  const [partsByCategory, setPartsByCategory] = useState<Record<string, number>>({})
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [totalTechnicians, setTotalTechnicians] = useState<number>(0)
  const [totalInventoryItems, setTotalInventoryItems] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Gọi tất cả 3 API song song để tối ưu performance
        const [statsRes, inventoryRes, serviceRes] = await Promise.all([
          fetch('http://localhost:4000/api/dashboard/stats'),
          fetch('http://localhost:4000/api/dashboard/inventory-stats'),
          fetch('http://localhost:4000/api/dashboard/service-stats')
        ])

        // Parse responses
        const [statsJson, inventoryJson, serviceJson] = await Promise.all([
          statsRes.json(),
          inventoryRes.json(),
          serviceRes.json()
        ])

        // Kiểm tra và set data
        if (statsJson.success) {
          setUsersByRole(statsJson.data.usersByRole || {})
          setUsersByStatus(statsJson.data.usersByStatus || { active: 0, disabled: 0 })
          setTotalUsers(statsJson.data.totalUsers || 0)
          setTotalTechnicians(statsJson.data.totalTechnicians || 0)
        } else {
          console.error('Stats API error:', statsJson.message)
        }

        if (inventoryJson.success) {
          setPartsByCategory(inventoryJson.data.byCategory || {})
          setTotalInventoryItems(inventoryJson.data.totalItems || 0)
        } else {
          console.error('Inventory API error:', inventoryJson.message)
        }

        if (serviceJson.success) {
          setServicesCount(serviceJson.data.byVehicleCategory || {})
        } else {
          console.error('Service API error:', serviceJson.message)
        }
      } catch (err) {
        console.error('Dashboard load error', err)
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.')
        // Không dùng fallback mock data nữa - để trống để user biết có lỗi
        setUsersByRole({})
        setUsersByStatus({ active: 0, disabled: 0 })
        setServicesCount({})
        setPartsByCategory({})
        setTotalUsers(0)
        setTotalTechnicians(0)
        setTotalInventoryItems(0)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Chart data với labels tiếng Việt
  const roleLabelsMap: Record<string, string> = {
    'admin': 'Quản trị viên',
    'staff': 'Nhân viên',
    'technician': 'Kỹ thuật viên',
    'customer': 'Khách hàng'
  }

  const rolesLabels = Object.keys(usersByRole)
  const rolesData = {
    labels: rolesLabels.map(role => roleLabelsMap[role] || role),
    datasets: [
      {
        label: 'Số lượng',
        data: rolesLabels.map(l => usersByRole[l] ?? 0),
        backgroundColor: ['#0ea5a4', '#06b6d4', '#6366f1', '#f97316', '#ef4444'],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  }

  const statusData = {
    labels: ['Hoạt động', 'Vô hiệu hóa'],
    datasets: [
      {
        data: [usersByStatus.active || 0, usersByStatus.disabled || 0],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
      },
    ],
  }

  const vehicleCategoryMap: Record<string, string> = {
    'CAR': 'Ô tô',
    'BICYCLE': 'Xe đạp điện',
    'MOTOBIKE': 'Xe máy điện'
  }

  const servicesLabels = Object.keys(servicesCount)
  const servicesData = {
    labels: servicesLabels.map(cat => vehicleCategoryMap[cat] || cat),
    datasets: [
      {
        label: 'Số dịch vụ',
        data: servicesLabels.map(l => servicesCount[l] ?? 0),
        backgroundColor: ['#60a5fa', '#f472b6', '#f59e0b', '#34d399'],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  }

  const categoryMap: Record<string, string> = {
    'tires': 'Lốp xe',
    'oil': 'Dầu nhớt',
    'filters': 'Lọc',
    'brakes': 'Phanh',
    'electrical': 'Điện',
    'cooling': 'Làm mát',
    'suspension': 'Giảm xóc',
    'transmission': 'Hộp số',
    'accessories': 'Phụ kiện'
  }

  const partsLabels = Object.keys(partsByCategory)
  const partsData = {
    labels: partsLabels.map(cat => categoryMap[cat] || cat),
    datasets: [
      {
        label: 'Số lượng',
        data: partsLabels.map(l => partsByCategory[l] ?? 0),
        backgroundColor: ['#a78bfa', '#fca5a5', '#34d399', '#fb923c', '#60a5fa', '#f472b6', '#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 0,
      },
    ],
  }

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      }
    }
  }
  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-0 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Đang tải dữ liệu dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-0 mb-2">Dashboard</h1>
            <p className="text-gray-600">Chào mừng bạn đến với hệ thống quản lý EVMS</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-blue-0 text-white hover:opacity-90 transition flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-red-800 font-medium">Lỗi tải dữ liệu</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Người dùng"
          value={totalUsers > 0 ? String(totalUsers) : '—'}
          change="+8%"
          changeType="positive"
          icon="👥"
          linkText="Quản lý người dùng"
          accentColor="bg-blue-0"
        />
        <StatCard
          title="Kỹ thuật viên"
          value={totalTechnicians > 0 ? String(totalTechnicians) : '—'}
          change="+3%"
          changeType="positive"
          icon="🔧"
          linkText="Quản lý kỹ thuật viên"
          accentColor="bg-azure-0"
        />
        <StatCard
          title="Linh kiện tồn kho"
          value={totalInventoryItems > 0 ? String(totalInventoryItems) : '—'}
          change="-2%"
          changeType="negative"
          icon="📦"
          linkText="Quản lý linh kiện"
          accentColor="bg-orange-0"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>👥</span>
            <span>Người dùng theo vai trò</span>
          </h3>
          <div className="h-64">
            <Bar data={rolesData} options={barChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>📊</span>
            <span>Trạng thái người dùng</span>
          </h3>
          <div className="flex items-center justify-center h-64">
            <Doughnut data={statusData} options={doughnutChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>🚗</span>
            <span>Dịch vụ theo loại xe</span>
          </h3>
          <div className="h-64">
            <Bar data={servicesData} options={barChartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>📦</span>
            <span>Linh kiện theo danh mục</span>
          </h3>
          <div className="flex items-center justify-center h-80">
            <Doughnut data={partsData} options={doughnutChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>👤</span>
            <span>Người dùng mới gần đây</span>
          </h3>
          <UsersTable />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
