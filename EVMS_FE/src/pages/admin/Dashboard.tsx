npnpimport React, { useState, useEffect } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import adminCar from '../../assets/images/admin_car.png'

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
  icon: React.ReactNode
  linkText: string
  accentColor: string
}> = ({ title, value, change, changeType, icon, linkText, accentColor }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${accentColor} flex items-center justify-center shadow-md border-2 border-white`}>
            {icon}
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
                    <div className="w-10 h-10 rounded-full bg-blue-0 flex items-center justify-center shadow-md">
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
                    user.role === 'admin' ? 'bg-blue-0/10 text-blue-0' :
                    user.role === 'staff' ? 'bg-azure-0/10 text-azure-0' :
                    user.role === 'technician' ? 'bg-blue-0/20 text-blue-0' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {roleLabels[user.role] || user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    user.isDisabled ? 'bg-gray-100 text-gray-600' : 'bg-azure-0/10 text-azure-0'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${user.isDisabled ? 'bg-gray-400' : 'bg-azure-0'}`}></span>
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
        backgroundColor: ['#014091', '#0991f3', '#67a9fd', '#49aef8', '#8abdfe'],
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
        backgroundColor: ['#0991f3', '#014091'],
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
        backgroundColor: ['#014091', '#0991f3', '#67a9fd', '#49aef8'],
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
        backgroundColor: [
          '#014091', // blue-0 - xanh đậm
          '#0991f3', // azure-0 - xanh sáng
          '#6366f1', // indigo - xanh tím
          '#8b5cf6', // purple - tím
          '#ec4899', // pink - hồng
          '#f59e0b', // amber - cam vàng
          '#10b981', // emerald - xanh lá
          '#6b7280', // gray - xám
          '#ef4444', // red - đỏ
        ],
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
      {/* Welcome Banner */}
      <div className="mb-8 relative overflow-visible rounded-2xl bg-white border border-gray-100 shadow-lg p-6 md:p-8 min-h-[140px]">
        {/* Wave decoration at top */}
        <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden rounded-t-2xl">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 250" preserveAspectRatio="none">
            <path d="M0,120 C300,200 600,50 900,120 C1050,160 1150,80 1200,120 L1200,0 L0,0 Z" fill="#0991f3" opacity="0.5"></path>
            <path d="M0,100 C300,180 600,30 900,100 C1050,140 1150,60 1200,100 L1200,0 L0,0 Z" fill="#014091" opacity="0.4"></path>
          </svg>
        </div>
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-azure-0/10 via-blue-0/10 to-azure-0/10 rounded-2xl"></div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-azure-0/5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-0/5 rounded-full -ml-12 -mb-12"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-azure-0/10 rounded-full"></div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 z-10 pl-2 md:pl-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              <span className="text-gray-700">Hi,</span>{' '}
              <span className="text-blue-0">
                Admin
              </span>
            </h2>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed font-medium">
              Quản lý hệ thống một cách hiệu quả
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm md:text-base">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-0/10 rounded-lg">
                <svg className="w-4 h-4 text-blue-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-gray-700 font-semibold">{totalUsers > 0 ? totalUsers : 0}</span>
                <span className="text-gray-600">người dùng</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-azure-0/10 rounded-lg">
                <svg className="w-4 h-4 text-azure-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700 font-semibold">{totalTechnicians > 0 ? totalTechnicians : 0}</span>
                <span className="text-gray-600">kỹ thuật viên</span>
              </div>
            </div>
          </div>
          
          {/* Car Image section - Absolute positioned to not affect banner size */}
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[350px] pointer-events-none">
            <img 
              src={adminCar} 
              alt="Admin Car" 
              className="w-full h-full object-contain scale-110"
            />
          </div>
        </div>
      </div>

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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          linkText="Quản lý người dùng"
          accentColor="bg-blue-0"
        />
        <StatCard
          title="Kỹ thuật viên"
          value={totalTechnicians > 0 ? String(totalTechnicians) : '—'}
          change="+3%"
          changeType="positive"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          linkText="Quản lý kỹ thuật viên"
          accentColor="bg-azure-0"
        />
        <StatCard
          title="Linh kiện tồn kho"
          value={totalInventoryItems > 0 ? String(totalInventoryItems) : '—'}
          change="-2%"
          changeType="negative"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          linkText="Quản lý linh kiện"
          accentColor="bg-blue-0"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Người dùng theo vai trò</span>
          </h3>
          <div className="h-64">
            <Bar data={rolesData} options={barChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-azure-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Trạng thái người dùng</span>
          </h3>
          <div className="flex items-center justify-center h-64">
            <Doughnut data={statusData} options={doughnutChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
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
            <svg className="w-5 h-5 text-azure-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Linh kiện theo danh mục</span>
          </h3>
          <div className="flex items-center justify-center h-80">
            <Doughnut data={partsData} options={doughnutChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Người dùng mới gần đây</span>
          </h3>
          <UsersTable />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
