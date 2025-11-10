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

// Interfaces (kept local, adjust if you have central types)
interface User {
  _id: string;
  userName: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  role: string;
  isDisabled: boolean;
}

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

// Inline StatCard (no external components)
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
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className={`absolute -top-8 -right-8 w-24 h-24 ${accentColor} opacity-15 rounded-full group-hover:opacity-20 transition-opacity duration-300`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl ${accentColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <div>
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">{title}</div>
              {linkText && linkText !== '—' && <div className="text-gray-400 text-xs">{linkText}</div>}
            </div>
          </div>

          {change && change !== '—' && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${changeType === 'positive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <span>{changeType === 'positive' ? '↗' : '↘'}</span>
              <span>{change}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">{value}</div>
        </div>
      </div>
    </div>
  )
}

// Inline UsersTable (no external components)
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
    } catch (err) {
      console.error('Lỗi khi lấy danh sách users:', err)
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600 mb-3">{error}</p>
        <button onClick={fetchUsers} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition">Thử lại</button>
      </div>
    )
  }

  if (users.length === 0) {
    return <div className="py-12 text-center text-gray-500"><p>Chưa có người dùng nào</p></div>
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
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">{user.fullName ? user.fullName.charAt(0).toUpperCase() : user.userName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{user.fullName || user.userName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-blue-50 text-blue-600' : user.role === 'staff' ? 'bg-azure-50 text-azure-600' : 'bg-gray-100 text-gray-800'}`}>
                    {roleLabels[user.role] || user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.isDisabled ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <span className={`w-2 h-2 rounded-full ${user.isDisabled ? 'bg-gray-400' : 'bg-emerald-500'}`}></span>
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

const StaffDashboard: React.FC = () => {
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
  const [totalAppointments, setTotalAppointments] = useState<number>(0)


  const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [revenueOverview, setRevenueOverview] = useState<RevenueOverview | null>(null)
  const [topServices, setTopServices] = useState<TopService[]>([])
  const [revenueComparison, setRevenueComparison] = useState<RevenueComparison | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(false)

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [statsRes, inventoryRes, serviceRes] = await Promise.all([
          fetch('http://localhost:4000/api/dashboard/stats'),
          fetch('http://localhost:4000/api/dashboard/inventory-stats'),
          fetch('http://localhost:4000/api/dashboard/service-stats')
        ])

        const [statsJson, inventoryJson, serviceJson] = await Promise.all([statsRes.json(), inventoryRes.json(), serviceRes.json()])

        if (statsJson.success) {
          setUsersByRole(statsJson.data.usersByRole || {})
          setUsersByStatus(statsJson.data.usersByStatus || { active: 0, disabled: 0 })
          setTotalUsers(statsJson.data.totalUsers || 0)
          setTotalTechnicians(statsJson.data.totalTechnicians || 0)
          setTotalAppointments(
            statsJson.data.totalAppointments
            ?? statsJson.data.appointmentsTotal
            ?? (statsJson.data.appointments ? statsJson.data.appointments.today || 0 : 0)
          )
        }

        if (inventoryJson.success) {
          setPartsByCategory(inventoryJson.data.byCategory || {})
          setTotalInventoryItems(inventoryJson.data.totalItems || 0)
        }

        if (serviceJson.success) {
          setServicesCount(serviceJson.data.byVehicleCategory || {})
        }
      } catch (err) {
        console.error('Dashboard load error', err)
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.')
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

  const loadRevenueData = async () => {
    setRevenueLoading(true)
    try {
      const [overviewRes, topServicesRes, comparisonRes] = await Promise.all([
        fetch(`http://localhost:4000/api/revenue/overview?period=${revenuePeriod}`),
        fetch(`http://localhost:4000/api/revenue/top-services?period=${revenuePeriod}&limit=5`),
        fetch(`http://localhost:4000/api/revenue/comparison`)
      ])
      const [overviewJson, topServicesJson, comparisonJson] = await Promise.all([overviewRes.json(), topServicesRes.json(), comparisonRes.json()])

      if (overviewJson.success) setRevenueOverview(overviewJson.data)
      if (topServicesJson.success) setTopServices(topServicesJson.data.topServices || [])
      if (comparisonJson.success) setRevenueComparison(comparisonJson.data)
    } catch (err) {
      console.error('Revenue load error', err)
    } finally {
      setRevenueLoading(false)
    }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  // Charts data
  const roleLabelsMap: Record<string, string> = { 'admin': 'Quản trị viên', 'staff': 'Nhân viên', 'technician': 'Kỹ thuật viên', 'customer': 'Khách hàng' }
  const rolesLabels = Object.keys(usersByRole)
  const rolesData = {
    labels: rolesLabels.map(role => roleLabelsMap[role] || role),
    datasets: [{ label: 'Số lượng', data: rolesLabels.map(l => usersByRole[l] ?? 0), backgroundColor: ['#014091', '#0991f3', '#67a9fd', '#49aef8', '#8abdfe'], borderRadius: 8, borderWidth: 0 }]
  }

  const statusData = { labels: ['Hoạt động', 'Vô hiệu hóa'], datasets: [{ data: [usersByStatus.active || 0, usersByStatus.disabled || 0], backgroundColor: ['#0991f3', '#014091'], borderWidth: 0 }] }

  const vehicleCategoryMap: Record<string, string> = { 'CAR': 'Ô tô', 'BICYCLE': 'Xe đạp điện', 'MOTOBIKE': 'Xe máy điện' }
  const servicesLabels = Object.keys(servicesCount)
  const servicesData = { labels: servicesLabels.map(cat => vehicleCategoryMap[cat] || cat), datasets: [{ label: 'Số dịch vụ', data: servicesLabels.map(l => servicesCount[l] ?? 0), backgroundColor: ['#014091', '#0991f3', '#67a9fd', '#49aef8'], borderRadius: 8, borderWidth: 0 }] }

  const categoryMap: Record<string, string> = { 'tires': 'Lốp xe', 'oil': 'Dầu nhớt', 'filters': 'Lọc', 'brakes': 'Phanh', 'electrical': 'Điện', 'cooling': 'Làm mát', 'suspension': 'Giảm xóc', 'transmission': 'Hộp số', 'accessories': 'Phụ kiện' }
  const partsLabels = Object.keys(partsByCategory)
  const partsData = { labels: partsLabels.map(cat => categoryMap[cat] || cat), datasets: [{ label: 'Số lượng', data: partsLabels.map(l => partsByCategory[l] ?? 0), backgroundColor: ['#014091', '#0991f3', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6b7280', '#ef4444'], borderWidth: 0 }] }

  // Chart options simplified
  const barChartOptions = { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }
  const doughnutChartOptions = { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' as const }, tooltip: {} } }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Đang tải dữ liệu dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleLogout = () => { logout(); navigate('/') }

  // Tính danh sách linh kiện sắp hết dựa trên partsData (labels + datasets[0].data)
  const lowStockList = (partsData?.labels ?? []).map((label, idx) => {
    const rawData = partsData?.datasets?.[0]?.data
    const count = Array.isArray(rawData) ? (rawData[idx] as number) ?? 0 : 0
    return { key: label, name: label, count }
  }).sort((a, b) => a.count - b.count).slice(0, 6)

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-2 pt-2 ">

      {/* Welcome + small banner */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative overflow-visible rounded-2xl bg-white border border-gray-100 shadow-lg p-6 md:p-8 min-h-[140px]">
            <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden rounded-t-2xl">
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 250" preserveAspectRatio="none">
                <path d="M0,120 C300,200 600,50 900,120 C1050,160 1150,80 1200,120 L1200,0 L0,0 Z" fill="#0991f3" opacity="0.5"></path>
                <path d="M0,100 C300,180 600,30 900,100 C1050,140 1150,60 1200,100 L1200,0 L0,0 Z" fill="#014091" opacity="0.4"></path>
              </svg>
            </div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1 z-10 pl-2 md:pl-4 pt-4 md:pt-6">
                <h1 className="text-3xl font-bold text-orange-600 mb-2">Staff Dashboard</h1>
                <p className="text-lg md:text-4xl font-semibold mb-3"><span className="text-gray-700">Hi,</span> <span className="text-blue-600">{user?.fullName || user?.userName || 'Staff'}</span></p>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed font-medium">Quản lý công việc cửa hàng, lịch hẹn, linh kiện và hỗ trợ khách hàng.</p>
              </div>

              <div className="hidden md:block absolute right-[-80px] top-1/2 -translate-y-1/2 w-[420px] h-[300px] pointer-events-none">
                <img src={adminCar} alt="overview" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg p-6 min-h-[140px] flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
              <div className="flex ml-30 items-center gap-2 flex-shrink-0 ">
                <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:opacity-90 transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span>Làm mới</span>
                </button>
                <button onClick={handleLogout} className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition">Đăng xuất</button>
              </div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="pt-4 border-t border-gray-200 text-center ml-30">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
                      <div className="text-sm font-semibold text-gray-500">{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        <StatCard title="Lịch hẹn" value={totalAppointments > 0 ? String(totalUsers) : '—'} change="+8%" changeType="positive" icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} linkText="Quản lý lịch hẹn" accentColor="bg-blue-0" />
        <StatCard title="Lịch hẹn chờ xác nhận" value={totalTechnicians > 0 ? String(totalTechnicians) : '—'} change="+3%" changeType="positive" icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} linkText="Lịch hẹn đang chờ xác nhận" accentColor="bg-emerald-50" />
        <StatCard title="Linh kiện tồn kho" value={totalInventoryItems > 0 ? String(totalInventoryItems) : '—'} change="-2%" changeType="negative" icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} linkText="Quản lý linh kiện" accentColor="bg-blue-0" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-1">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Lịch hẹn</h3>
          <div className="h-64"><Bar data={rolesData} options={barChartOptions} /></div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Trạng thái phụ tùng</h3>
          <div className="flex items-center justify-center h-64"><Doughnut data={statusData} options={doughnutChartOptions} /></div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Linh kiện sắp hết hàng</h3>
          {lowStockList.length === 0 ? (
            <div className="text-sm text-gray-500">Không có linh kiện sắp hết.</div>
          ) : (
            <ul className="space-y-4">
              {lowStockList.map(item => {
                const pct = Math.min(100, Math.round((item.count / 50) * 100)) // assume 50 as a visual "full" reference
                const barColor = item.count <= 5 ? 'bg-red-500' : item.count <= 12 ? 'bg-amber-500' : 'bg-green-500'
                return (
                  <li key={item.key} className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                        <div className="text-xs text-gray-500 ml-4">{item.count} cái</div>
                      </div>
                      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`${barColor} h-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => navigate('/staff/parts')}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Quản lý
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>

  );
};

export default StaffDashboard;