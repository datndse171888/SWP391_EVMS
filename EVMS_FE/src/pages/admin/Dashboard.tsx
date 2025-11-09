import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import adminCar from '../../assets/images/admin_car.png'
import { useAuth } from '../../contexts/AuthContext'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)


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

// Interfaces cho Revenue
interface RevenueOverview {
  totalRevenue: number
  totalTransactions: number
  averageTransaction: number
  byPaymentMethod: Record<string, { revenue: number; count: number }>
  byDate: Array<{ date: string; revenue: number; count: number }>
  period: { start: string; end: string }
}

interface TopService {
  serviceID: string
  serviceName: string
  vehicleCategory: string
  totalRevenue: number
  totalBookings: number
  averageRevenue: number
}

interface RevenueComparison {
  thisMonth: { revenue: number; transactions: number; period: { start: string; end: string } }
  lastMonth: { revenue: number; transactions: number; period: { start: string; end: string } }
  growth: { revenue: number; transactions: number }
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
  const isBlue = accentColor === 'bg-blue-0'
  const gradientClass = isBlue ? 'from-blue-0/5 to-azure-0/5' : 'from-azure-0/5 to-blue-0/5'
  
  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Decorative circle */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 ${accentColor} opacity-5 rounded-full group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl ${accentColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {icon}
              </div>
              <div className="flex-1">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">{title}</div>
                {linkText && linkText !== '—' && (
                  <div className="text-gray-400 text-xs">{linkText}</div>
                )}
              </div>
            </div>
          </div>
          {change && change !== '—' && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
              changeType === 'positive'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}>
              <span>{changeType === 'positive' ? '↗' : '↘'}</span>
              <span>{change}</span>
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="mt-4">
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">{value}</div>
        </div>
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
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [usersByRole, setUsersByRole] = useState<Record<string, number>>({})
  const [usersByStatus, setUsersByStatus] = useState<{ active: number; disabled: number }>({ active: 0, disabled: 0 })
  const [servicesCount, setServicesCount] = useState<Record<string, number>>({})
  const [partsByCategory, setPartsByCategory] = useState<Record<string, number>>({})
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [totalTechnicians, setTotalTechnicians] = useState<number>(0)
  const [totalInventoryItems, setTotalInventoryItems] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Revenue states
  const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [revenueOverview, setRevenueOverview] = useState<RevenueOverview | null>(null)
  const [topServices, setTopServices] = useState<TopService[]>([])
  const [revenueComparison, setRevenueComparison] = useState<RevenueComparison | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(false)
  
  // Clock state
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

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
    loadRevenueData()
  }, [revenuePeriod])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Load revenue data
  const loadRevenueData = async () => {
    setRevenueLoading(true)
    try {
      const [overviewRes, topServicesRes, comparisonRes] = await Promise.all([
        fetch(`http://localhost:4000/api/revenue/overview?period=${revenuePeriod}`),
        fetch(`http://localhost:4000/api/revenue/top-services?period=${revenuePeriod}&limit=5`),
        fetch(`http://localhost:4000/api/revenue/comparison`)
      ])

      const [overviewJson, topServicesJson, comparisonJson] = await Promise.all([
        overviewRes.json(),
        topServicesRes.json(),
        comparisonRes.json()
      ])

      if (overviewJson.success) {
        setRevenueOverview(overviewJson.data)
      }

      if (topServicesJson.success) {
        setTopServices(topServicesJson.data.topServices || [])
      }

      if (comparisonJson.success) {
        setRevenueComparison(comparisonJson.data)
      }
    } catch (err) {
      console.error('Revenue load error', err)
    } finally {
      setRevenueLoading(false)
    }
  }

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

  // Revenue chart data - Updated colors to match Dashboard theme
  const revenueByDateData = {
    labels: revenueOverview?.byDate.map(d => new Date(d.date).toLocaleDateString('vi-VN')) || [],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: revenueOverview?.byDate.map(d => d.revenue) || [],
        borderColor: '#014091', // blue-0
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(1, 64, 145, 0.3)'); // blue-0 with opacity
          gradient.addColorStop(1, 'rgba(9, 145, 243, 0.01)'); // azure-0 with opacity
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#014091', // blue-0
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#0991f3', // azure-0
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
      },
    ],
  }

  const topServicesData = {
    labels: topServices.map(s => s.serviceName),
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: topServices.map(s => s.totalRevenue),
        backgroundColor: [
          '#014091', // blue-0
          '#0991f3', // azure-0
          '#67a9fd', // lighter blue
          '#49aef8', // lighter azure
          '#8abdfe', // lightest blue
        ],
        borderColor: [
          '#014091',
          '#0991f3',
          '#67a9fd',
          '#49aef8',
          '#8abdfe',
        ],
        borderWidth: 2,
        borderRadius: 10,
        hoverBackgroundColor: [
          '#0991f3',
          '#67a9fd',
          '#49aef8',
          '#8abdfe',
          '#014091',
        ],
      },
    ],
  }

  const paymentMethodData = {
    labels: Object.keys(revenueOverview?.byPaymentMethod || {}).map(m => m === 'CASH' ? 'Tiền mặt' : 'PayOS'),
    datasets: [
      {
        data: Object.values(revenueOverview?.byPaymentMethod || {}).map(v => v.revenue),
        backgroundColor: [
          '#0991f3', // azure-0
          '#014091', // blue-0
        ],
        borderColor: [
          '#0991f3',
          '#014091',
        ],
        borderWidth: 3,
        hoverBackgroundColor: [
          '#67a9fd',
          '#49aef8',
        ],
        hoverBorderColor: '#fff',
        hoverBorderWidth: 4,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `💰 Doanh thu: ${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: (value: any) => `${(value / 1000000).toFixed(1)}M`,
          color: '#64748b',
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 }
        }
      }
    }
  }

  const revenueBarChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `💰 Doanh thu: ${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: (value: any) => `${(value / 1000000).toFixed(1)}M`,
          color: '#64748b',
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 }
        }
      }
    }
  }

  const revenueDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: { size: 12 },
          color: '#475569',
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
        callbacks: {
          label: (context: any) => `${context.label}: ${formatCurrency(context.parsed)}`
        }
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

      {/* Welcome Banner */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Banner - spans 2 columns */}
          <div className="md:col-span-2 relative overflow-visible rounded-2xl bg-white border border-gray-100 shadow-lg p-6 md:p-8 min-h-[140px]">
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
              <div className="hidden md:block absolute right-[-80px] top-1/2 -translate-y-1/2 w-[550px] h-[400px] pointer-events-none">
                <img 
                  src={adminCar} 
                  alt="Admin Car" 
                  className="w-full h-full object-contain scale-110"
                />
              </div>
            </div>
          </div>
          
          {/* Admin Info and Clock Widget */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg p-6 min-h-[140px] flex flex-col">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-0/5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-azure-0/5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 flex flex-col gap-4">
                {/* Admin Profile Section */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {user?.photoURL ? (
                      <div className="flex-shrink-0" style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px' }}>
                        <img
                          src={user.photoURL}
                          alt="Avatar"
                          className="w-full h-full rounded-full border-2 border-blue-0/30 object-cover"
                          style={{ aspectRatio: '1/1' }}
                        />
                      </div>
                    ) : (
                      <div 
                        className="rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"
                        style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px' }}
                      >
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || user?.userName || 'Admin User'}</div>
                      <div className="text-xs text-gray-500 truncate">{user?.email || 'admin@evms.com'}</div>
                    </div>
                  </div>
                  
                  {/* Action Icons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate('/admin/profile')}
                      className="p-2 rounded-lg border border-blue-0/30 text-blue-0 hover:bg-blue-0/10 transition-all duration-200 group"
                      title="Chỉnh sửa hồ sơ"
                      aria-label="Chỉnh sửa hồ sơ"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-all duration-200 group"
                      title="Đăng xuất"
                      aria-label="Đăng xuất"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Clock Section */}
                <div className="pt-4 border-t border-gray-200 text-center">
                  <div className="text-3xl font-bold text-blue-0 mb-1">
                    {currentTime.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false 
                    })}
                  </div>
                  <div className="text-sm font-semibold text-azure-0">
                    {currentTime.toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Revenue Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-0 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-0 mb-1">Báo Cáo Doanh Thu</h2>
              <p className="text-gray-600 text-sm">Phân tích doanh thu và hiệu suất kinh doanh</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={revenuePeriod}
                onChange={(e) => setRevenuePeriod(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-0 focus:border-transparent shadow-sm hover:shadow-md transition-all cursor-pointer font-medium text-gray-700 text-sm"
              >
                <option value="day">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="year">1 năm qua</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button
              onClick={loadRevenueData}
              className="px-4 py-2.5 rounded-xl bg-blue-0 text-white hover:bg-azure-0 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Revenue Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng doanh thu"
            value={revenueOverview ? formatCurrency(revenueOverview.totalRevenue) : '—'}
            change={revenueComparison ? `${revenueComparison.growth.revenue > 0 ? '+' : ''}${revenueComparison.growth.revenue.toFixed(1)}%` : '—'}
            changeType={revenueComparison && revenueComparison.growth.revenue >= 0 ? 'positive' : 'negative'}
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            linkText={`${revenuePeriod === 'day' ? 'Hôm nay' : revenuePeriod === 'week' ? '7 ngày' : revenuePeriod === 'month' ? '30 ngày' : '1 năm'}`}
            accentColor="bg-blue-0"
          />
          <StatCard
            title="Số giao dịch"
            value={revenueOverview ? String(revenueOverview.totalTransactions) : '—'}
            change={revenueComparison ? `${revenueComparison.growth.transactions > 0 ? '+' : ''}${revenueComparison.growth.transactions.toFixed(1)}%` : '—'}
            changeType={revenueComparison && revenueComparison.growth.transactions >= 0 ? 'positive' : 'negative'}
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            linkText="Giao dịch"
            accentColor="bg-azure-0"
          />
          <StatCard
            title="Giá trị TB/giao dịch"
            value={revenueOverview ? formatCurrency(revenueOverview.averageTransaction) : '—'}
            change="—"
            changeType="positive"
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
            linkText="Trung bình"
            accentColor="bg-blue-0"
          />
          <StatCard
            title="Doanh thu tháng này"
            value={revenueComparison ? formatCurrency(revenueComparison.thisMonth.revenue) : '—'}
            change="—"
            changeType="positive"
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            linkText={`So với tháng trước: ${revenueComparison ? formatCurrency(revenueComparison.lastMonth.revenue) : '—'}`}
            accentColor="bg-azure-0"
          />
        </div>

        {/* Revenue Charts - All 3 in one row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Biểu đồ doanh thu theo thời gian */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-0 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu theo thời gian</h3>
                  <p className="text-xs text-gray-500">Theo dõi xu hướng doanh thu</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-blue-0/10 text-blue-0 text-xs font-semibold">
                {revenueOverview?.byDate.length || 0} điểm dữ liệu
              </div>
            </div>
            <div className="h-80">
              {revenueLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-0"></div>
                </div>
              ) : (
                <Line data={revenueByDateData} options={lineChartOptions} />
              )}
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-azure-0 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Phương thức thanh toán</h3>
                <p className="text-xs text-gray-500">Phân bổ theo loại</p>
              </div>
            </div>
            <div className="h-80 flex items-center justify-center">
              {revenueLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azure-0"></div>
                </div>
              ) : (
                <Doughnut data={paymentMethodData} options={revenueDoughnutOptions} />
              )}
            </div>
          </div>

          {/* Top 5 Dịch Vụ */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-0 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Top 5 Dịch Vụ</h3>
                  <p className="text-xs text-gray-500">Doanh thu cao nhất</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-blue-0/10 text-blue-0 text-xs font-semibold">
                {topServices.length} dịch vụ
              </div>
            </div>
            <div className="h-80">
              {revenueLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-0"></div>
                </div>
              ) : (
                <Bar data={topServicesData} options={revenueBarChartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Service Details Table */}
        {topServices.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Chi tiết dịch vụ</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topServices.map((service, index) => (
                <div
                  key={service.serviceID}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-blue-0' : index === 1 ? 'bg-azure-0' : 'bg-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">{service.vehicleCategory}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-2 line-clamp-2">{service.serviceName}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Doanh thu:</span>
                      <span className="text-xs font-bold text-blue-0">{formatCurrency(service.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Số lượt:</span>
                      <span className="text-xs font-bold text-azure-0">{service.totalBookings}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
