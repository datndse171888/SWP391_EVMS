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

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [partsByCategory, setPartsByCategory] = useState<Record<string, number>>({})
  const [totalInventoryItems, setTotalInventoryItems] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointmentStatus, setAppointmentStatus] = useState<{ confirmed: number; pending: number }>({ confirmed: 0, pending: 0 })
  const [totalAppointments, setTotalAppointments] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [partsStatus, setPartsStatus] = useState<{ inStock: number; lowStock: number }>({ inStock: 0, lowStock: 0 })



  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {

        // Get auth token from localStorage or context
        const token = localStorage.getItem('accessToken') // adjust key as needed
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const [statsRes, inventoryRes, serviceRes] = await Promise.all([
          fetch('http://localhost:4000/api/dashboard/stats'),
          fetch('http://localhost:4000/api/dashboard/inventory-stats'),
          fetch('http://localhost:4000/api/dashboard/service-stats')
        ])

        const [statsJson, inventoryJson, serviceJson] = await Promise.all([statsRes.json(), inventoryRes.json(), serviceRes.json()])


        // fetch appointment status counts
        try {
          const totalRes = await fetch('http://localhost:4000/api/appointments/count/all', { headers, cache: 'no-cache' });
          if (totalRes.ok) {
            const totalJson = await totalRes.json()
            // Handle response format: {"totalAll":6} or {"success":true, "data":{"count":6}}
            if (typeof totalJson.totalAll === 'number') {
              setTotalAppointments(Number(totalJson.totalAll))
            } else if (totalJson.success && typeof totalJson.data?.count === 'number') {
              setTotalAppointments(Number(totalJson.data.count))
            } else if (typeof totalJson.count === 'number') {
              setTotalAppointments(Number(totalJson.count))
            }
          }
          const [resConfirmedCancel, resPending] = await Promise.all([
            fetch('http://localhost:4000/api/appointments/count/confirmed-cancelled', { headers, cache: 'no-cache' }),
            fetch('http://localhost:4000/api/appointments/count/pending', { headers, cache: 'no-cache' }),
          ])

          let confirmed = 0
          let cancelled = 0
          let pending = 0

          if (resConfirmedCancel.ok) {
            const json = await resConfirmedCancel.json()
            // Handle response format: {"totalConfirmed":2,"totalCancelled":0}
            if (typeof json.totalConfirmed === 'number') {
              confirmed = Number(json.totalConfirmed)
            } else if (typeof json.confirmed === 'number') {
              confirmed = Number(json.confirmed)
            } else if (json.success && json.data) {
              confirmed = Number(json.data.confirmed || 0)
            }

            if (typeof json.totalCancelled === 'number') {
              cancelled = Number(json.totalCancelled)
            } else if (typeof json.cancelled === 'number') {
              cancelled = Number(json.cancelled)
            } else if (json.success && json.data) {
              cancelled = Number(json.data.cancelled || 0)
            }
          }

          if (resPending.ok) {
            const json = await resPending.json()
            if (typeof json.totalPending === 'number') {
              pending = Number(json.totalPending)
            } else if (typeof json.pending === 'number') {
              pending = Number(json.pending)
            } else if (json.success && json.data) {
              pending = Number(json.data.pending ?? json.data.count ?? 0)
            } else if (typeof json.count === 'number') {
              pending = Number(json.count)
            }
          }
          // fallback to statsJson if both calls failed
          if (!resConfirmedCancel.ok && !resPending.ok && statsJson.success && statsJson.data?.appointmentsSummary) {
            const s = statsJson.data.appointmentsSummary
            confirmed = Number(s.confirmed || 0)
            cancelled = Number(s.cancelled || 0)
            pending = Number(s.pending || 0)
          }

          setAppointmentStatus({ confirmed, pending })


        } catch (err) {
          console.warn('Không thể lấy status-count appointments:', err)
        }

        // fetch parts status counts
        try {
          const partsStatusRes = await fetch('http://localhost:4000/api/inventories/count/by-status', { headers, cache: 'no-cache' })
          if (partsStatusRes.ok) {
            const partsStatusJson = await partsStatusRes.json()
            // Handle various response formats
            let totalLowStock = 0
            let totalInStock = 0

            if (partsStatusJson.success && partsStatusJson.data) {
              totalLowStock = Number(partsStatusJson.data.totalLowStock || 0)
              totalInStock = Number(partsStatusJson.data.totalInStock || 0)
            } else if (typeof partsStatusJson.totalLowStock === 'number') {
              totalLowStock = Number(partsStatusJson.totalLowStock)
              totalInStock = Number(partsStatusJson.totalInStock || 0)
            }

            setPartsStatus({ inStock: totalInStock, lowStock: totalLowStock })
          }
        } catch (err) {
          console.warn('Không thể lấy status-count parts:', err)
        }


        if (inventoryJson.success) {
          setPartsByCategory(inventoryJson.data.byCategory || {})
          setTotalInventoryItems(inventoryJson.data.totalItems || 0)
        }


      } catch (err) {
        console.error('Dashboard load error', err)
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.')
        setPartsByCategory({})
        setTotalInventoryItems(0)
        setTotalAppointments(0)
        setPartsStatus({ inStock: 0, lowStock: 0 })

        setAppointmentStatus({ confirmed: 0, pending: 0 })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])



  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)


  // appointment status chart data (Đã xác nhận, Chờ xác nhận, Đã hủy)
  const appointmentStatusData = {
    labels: ['Đã xác nhận', 'Chờ xác nhận'],
    datasets: [
      {
        data: [appointmentStatus.confirmed || 0, appointmentStatus.pending || 0],
        backgroundColor: ['#10b981', '#f59e0b',],
        hoverOffset: 6
      },
    ],
  }

  const appointmentStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
    cutout: '45%',
  }

  const partsStatusData = {
    labels: ['Còn hàng', 'Sắp hết'],
    datasets: [
      {
        data: [partsStatus.inStock || 0, partsStatus.lowStock || 0],
        backgroundColor: ['#05c205ff', '#f3a827ff'],
        hoverOffset: 6,
      },
    ],
  }

  const partsStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
    cutout: '45%',
  }

  const categoryMap: Record<string, string> = { 'tires': 'Lốp xe', 'oil': 'Dầu nhớt', 'filters': 'Lọc', 'brakes': 'Phanh', 'electrical': 'Điện', 'cooling': 'Làm mát', 'suspension': 'Giảm xóc', 'transmission': 'Hộp số', 'accessories': 'Phụ kiện' }
  const partsLabels = Object.keys(partsByCategory)
  const partsData = { labels: partsLabels.map(cat => categoryMap[cat] || cat), datasets: [{ label: 'Số lượng', data: partsLabels.map(l => partsByCategory[l] ?? 0), backgroundColor: ['#014091', '#0991f3', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6b7280', '#ef4444'], borderWidth: 0 }] }

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

  // Tính danh sách linh kiện sắp hết dựa trên partsData (labels + datasets[0].data)
  const lowStockList = (partsData?.labels ?? []).map((label, idx) => {
    const rawData = partsData?.datasets?.[0]?.data
    const count = Array.isArray(rawData) ? (rawData[idx] as number) ?? 0 : 0
    return { key: label, name: label, count }
  }).sort((a, b) => a.count - b.count).slice(0, 10)

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
              <div className="flex ml-35 items-center gap-2 flex-shrink-0 ">
                <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:opacity-90 transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span>Làm mới</span>
                </button>
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
        <StatCard title="Lịch hẹn" value={totalAppointments > 0 ? String(totalAppointments) : '—'} change="+8%" changeType="positive" icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} linkText="Quản lý lịch hẹn" accentColor="bg-blue-0" />
        <StatCard title="Lịch hẹn chờ xác nhận" value={appointmentStatus.pending > 0 ? String(appointmentStatus.pending) : '—'} change="+3%" changeType="positive" icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} linkText="Lịch hẹn đang chờ xác nhận" accentColor="bg-emerald-200" />
        <StatCard title="Linh kiện tồn kho" value={totalInventoryItems > 0 ? String(totalInventoryItems) : '—'} change="-2%" changeType="negative" icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} linkText="Quản lý linh kiện" accentColor="bg-blue-0" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-1">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Trạng thái lịch hẹn</h3>
          <div className="flex items-center justify-center h-64"><Doughnut data={appointmentStatusData} options={appointmentStatusOptions} /></div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Trạng thái phụ tùng</h3>
          <div className="flex items-center justify-center h-64"><Doughnut data={partsStatusData} options={partsStatusOptions} /></div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Kho linh kiện</h3>
            <button
              onClick={() => navigate('/staff/parts')}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Quản lý →
            </button>
          </div>          {lowStockList.length === 0 ? (
            <div className="text-sm text-gray-500">Không có linh kiện sắp hết.</div>
          ) : (
            <div className='h-64 overflow-y-auto pr-2 custom-scrollbarPart'>
              <ul className="space-y-4">
                {lowStockList.map(item => {
                  const pct = Math.min(100, Math.round((item.count / 3) * 100))
                  const barColor = item.count <= 2 ? 'bg-red-500' : item.count <= 5 ? 'bg-amber-500' : 'bg-green-500'
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
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default StaffDashboard;