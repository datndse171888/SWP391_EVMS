import React, { useState, useEffect } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// Interfaces
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

// Stat Card Component - Enhanced
const StatCard: React.FC<{
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative'
  icon: string
  subtitle?: string
  gradient?: string
}> = ({ title, value, change, changeType, icon, subtitle, gradient = 'from-blue-500 to-blue-600' }) => {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-white text-xl">{icon}</span>
            </div>
            <div>
              <div className="text-gray-500 text-xs font-medium uppercase tracking-wide">{title}</div>
              {subtitle && <div className="text-gray-400 text-xs mt-0.5">{subtitle}</div>}
            </div>
          </div>
          {change && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              changeType === 'positive'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}>
              <span>{changeType === 'positive' ? '↗' : '↘'}</span>
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
      </div>
    </div>
  )
}

export const Revenue: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [overview, setOverview] = useState<RevenueOverview | null>(null)
  const [topServices, setTopServices] = useState<TopService[]>([])
  const [comparison, setComparison] = useState<RevenueComparison | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [overviewRes, topServicesRes, comparisonRes] = await Promise.all([
        fetch(`http://localhost:4000/api/revenue/overview?period=${period}`),
        fetch(`http://localhost:4000/api/revenue/top-services?period=${period}&limit=5`),
        fetch(`http://localhost:4000/api/revenue/comparison`)
      ])

      const [overviewJson, topServicesJson, comparisonJson] = await Promise.all([
        overviewRes.json(),
        topServicesRes.json(),
        comparisonRes.json()
      ])

      if (overviewJson.success) {
        setOverview(overviewJson.data)
      }

      if (topServicesJson.success) {
        setTopServices(topServicesJson.data.topServices || [])
      }

      if (comparisonJson.success) {
        setComparison(comparisonJson.data)
      }
    } catch (err) {
      console.error('Revenue load error', err)
      setError('Không thể tải dữ liệu doanh thu. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Loading state - Enhanced
  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-100 border-t-blue-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <p className="text-gray-700 text-lg font-semibold mb-2">Đang tải dữ liệu doanh thu...</p>
            <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    )
  }

  // Chart data - Enhanced with better colors
  const revenueByDateData = {
    labels: overview?.byDate.map(d => new Date(d.date).toLocaleDateString('vi-VN')) || [],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: overview?.byDate.map(d => d.revenue) || [],
        borderColor: '#3b82f6',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#2563eb',
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
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 158, 11, 0.8)',   // Amber
          'rgba(239, 68, 68, 0.8)',    // Red
          'rgba(139, 92, 246, 0.8)',   // Purple
        ],
        borderColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
        ],
        borderWidth: 2,
        borderRadius: 10,
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
      },
    ],
  }

  const paymentMethodData = {
    labels: Object.keys(overview?.byPaymentMethod || {}).map(m => m === 'CASH' ? 'Tiền mặt' : 'PayOS'),
    datasets: [
      {
        data: Object.values(overview?.byPaymentMethod || {}).map(v => v.revenue),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          '#10b981',
          '#3b82f6',
        ],
        borderWidth: 3,
        hoverBackgroundColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
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
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 16,
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        titleFont: { size: 14, weight: 'bold' },
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

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 16,
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        titleFont: { size: 14, weight: 'bold' },
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: { size: 12, weight: '600' },
          color: '#475569',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 16,
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `${context.label}: ${formatCurrency(context.parsed)}`
        }
      }
    }
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 min-h-screen">
      {/* Header - Enhanced */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">💰</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1">
                Báo Cáo Doanh Thu
              </h1>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <span>📊</span>
                <span>Phân tích doanh thu và hiệu suất kinh doanh</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all cursor-pointer font-medium text-gray-700"
              >
                <option value="day">📅 Hôm nay</option>
                <option value="week">📅 7 ngày qua</option>
                <option value="month">📅 30 ngày qua</option>
                <option value="year">📅 1 năm qua</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button
              onClick={loadData}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
            >
              <span className="text-lg">🔄</span>
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert - Enhanced */}
      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-5 flex items-start gap-4 shadow-md animate-pulse">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl">⚠️</span>
          </div>
          <div className="flex-1">
            <p className="text-red-900 font-bold text-lg mb-1">Lỗi tải dữ liệu</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(overview?.totalRevenue || 0)}
          change={comparison ? `${comparison.growth.revenue > 0 ? '+' : ''}${comparison.growth.revenue.toFixed(1)}%` : undefined}
          changeType={comparison && comparison.growth.revenue >= 0 ? 'positive' : 'negative'}
          icon="💰"
          subtitle={`${period === 'day' ? 'Hôm nay' : period === 'week' ? '7 ngày' : period === 'month' ? '30 ngày' : '1 năm'}`}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Số giao dịch"
          value={String(overview?.totalTransactions || 0)}
          change={comparison ? `${comparison.growth.transactions > 0 ? '+' : ''}${comparison.growth.transactions.toFixed(1)}%` : undefined}
          changeType={comparison && comparison.growth.transactions >= 0 ? 'positive' : 'negative'}
          icon="📊"
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Giá trị TB/giao dịch"
          value={formatCurrency(overview?.averageTransaction || 0)}
          icon="💳"
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Doanh thu tháng này"
          value={formatCurrency(comparison?.thisMonth.revenue || 0)}
          icon="📈"
          subtitle={`So với tháng trước: ${formatCurrency(comparison?.lastMonth.revenue || 0)}`}
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Row 1 - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-32 -mt-32 opacity-50"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">📈</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu theo thời gian</h3>
                  <p className="text-xs text-gray-500">Theo dõi xu hướng doanh thu</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold">
                {overview?.byDate.length || 0} điểm dữ liệu
              </div>
            </div>
            <div className="h-80">
              <Line data={revenueByDateData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-50 to-transparent rounded-full -mr-24 -mt-24 opacity-50"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-white text-lg">💳</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Phương thức thanh toán</h3>
                <p className="text-xs text-gray-500">Phân bổ theo loại</p>
              </div>
            </div>
            <div className="h-80 flex items-center justify-center">
              <Doughnut data={paymentMethodData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Services - Enhanced */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 mb-8 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-50 to-transparent rounded-full -mr-48 -mt-48 opacity-50"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                <span className="text-white text-xl">🏆</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Top 5 Dịch Vụ Có Doanh Thu Cao Nhất</h3>
                <p className="text-sm text-gray-500">Xếp hạng theo doanh thu trong kỳ</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-amber-50 text-amber-600 text-sm font-semibold">
              {topServices.length} dịch vụ
            </div>
          </div>
          <div className="h-80">
            <Bar data={topServicesData} options={barChartOptions} />
          </div>

          {/* Service Details Table */}
          {topServices.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>Chi tiết dịch vụ</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topServices.map((service, index) => (
                  <div
                    key={service.serviceID}
                    className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">{service.vehicleCategory}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-2 line-clamp-2">{service.serviceName}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Doanh thu:</span>
                        <span className="text-xs font-bold text-emerald-600">{formatCurrency(service.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Số lượt:</span>
                        <span className="text-xs font-bold text-blue-600">{service.totalBookings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-white text-xl">ℹ️</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-800 mb-1">Thông tin báo cáo</h4>
            <p className="text-xs text-gray-600">
              Dữ liệu được tính từ các appointment đã hoàn thành (status = 'completed').
              Doanh thu được lấy từ giá dịch vụ hoặc gói dịch vụ tương ứng.
              Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

