import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AppointmentApi } from '../../api/AppointmentApi'
import { UserApi } from '../../api/UserApi'
import { ServiceApi } from '../../api/ServiceApi'
import { ServicePackageApi } from '../../api/ServicePackageApi'
import { fetchParts } from '../../api/PartApi'
import { VehicleApi } from '../../api/VehicleApi'
import { PaymentApi } from '../../api/PaymentApi'
import type { Part } from '../../types/Part'
import type { VehicleResponse } from '../../types/Vehicle'

type StepKey = 1 | 2 | 3 | 4

type AppointmentLite = {
  id: string
  userID?: string
  vehicleID?: string
  customerName: string
  customerPhone: string
  bookingDateISO?: string
  dateText: string
  timeText: string
  status?: string
  descriptionText?: string
  tags?: string[]
  vehicleCategory?: string
  kind?: 'service' | 'package'
  servicePrice?: number
}

type PartItem = Part

type CartLine = {
  part: PartItem
  quantity: number
}

// No mock data; real data will be fetched from BE

const currency = (v: number) => (v || 0).toLocaleString('vi-VN') + ' ₫'

const BookingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState<StepKey>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: find appointment
  const [searchText, setSearchText] = useState('')
  const [appointments, setAppointments] = useState<AppointmentLite[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentLite | null>(null)

  // Step 2: parts selection
  // Parts from API
  const [partsSearch, setPartsSearch] = useState('')
  const [parts, setParts] = useState<PartItem[]>([])
  const [partsPage, setPartsPage] = useState(1)
  const [partsTotalPages, setPartsTotalPages] = useState(1)
  const [partsLoading, setPartsLoading] = useState(false)
  const partsPageSize = 8
  const [partsGoTo, setPartsGoTo] = useState('')
  const partsCacheRef = useRef<Record<string, PartItem[]>>({})
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search to reduce requests and flicker
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(partsSearch.trim()), 250)
    return () => clearTimeout(t)
  }, [partsSearch])
  const [cartLines, setCartLines] = useState<CartLine[]>([])

  // Step 3: payment
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'PAYOS' | ''>('')
  const [note, setNote] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null)
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // Derived totals
  const serviceFee = selectedAppointment?.servicePrice || 0
  const partsTotal = useMemo(() => cartLines.reduce((sum, l) => sum + l.part.price * l.quantity, 0), [cartLines])
  const grandTotal = serviceFee + partsTotal

  useEffect(() => {
    const fetchApts = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await AppointmentApi.getTodayAwaitingPayment()
        type BackendAppointment = { _id?: string; id?: string; userID?: string; vehicleID?: string; bookingDate?: string; status?: string; serviceID?: unknown; serviceId?: unknown; service?: unknown; servicePackageID?: unknown; servicePackageId?: unknown; servicePackage?: unknown }
        const list = (res?.data?.data || []) as BackendAppointment[]
        // Build minimal list; enrich with user name/phone
        const uniqueUserIds = Array.from(new Set(list.map(a => a.userID).filter((id): id is string => Boolean(id))))
        const userCache = new Map<string, { fullName?: string; userName?: string; phoneNumber?: string }>()
        await Promise.all(uniqueUserIds.map(async (uid: string) => {
          try {
            const ures = await UserApi.getUserById(uid)
            userCache.set(uid, {
              fullName: ures?.data?.fullName,
              userName: ures?.data?.userName,
              phoneNumber: ures?.data?.phoneNumber,
            })
          } catch {
            userCache.set(uid, {})
          }
        }))

        const formatDate = (iso: string) => {
          const d = new Date(iso)
          return isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN')
        }
        const formatTime = (iso: string) => {
          const d = new Date(iso)
          return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }

        // API already returns today's appointments with awaiting_payment status
        const source = list

        // helpers to extract ids
        const getServiceId = (a: BackendAppointment): string | undefined => {
          const raw: unknown = (a as unknown as Record<string, unknown>).serviceID
            ?? (a as unknown as Record<string, unknown>).serviceId
            ?? (a as unknown as Record<string, unknown>).service
          const sid = raw as unknown
          if (!sid) return undefined
          if (typeof sid === 'string') return sid
          if (typeof sid === 'object') {
            const o = sid as { _id?: string; id?: string }
            return String(o?._id || o?.id || '')
          }
          return undefined
        }
        const getServicePackageId = (a: BackendAppointment): string | undefined => {
          const raw: unknown = (a as unknown as Record<string, unknown>).servicePackageID
            ?? (a as unknown as Record<string, unknown>).servicePackageId
            ?? (a as unknown as Record<string, unknown>).servicePackage
          const pid = raw as unknown
          if (!pid) return undefined
          if (typeof pid === 'string') return pid
          if (typeof pid === 'object') {
            const o = pid as { _id?: string; id?: string }
            return String(o?._id || o?.id || '')
          }
          return undefined
        }

        const serviceIds = Array.from(new Set(source.map(a => getServiceId(a)).filter((x): x is string => Boolean(x))))
        const servicePackageIds = Array.from(new Set(source.map(a => getServicePackageId(a)).filter((x): x is string => Boolean(x))))

        type ServiceLite = { name?: string; description?: string; vehicleCategory?: string; price?: number } | undefined
        type ServicePackageLite = { name?: string; vehicleCategory?: string; price?: number } | undefined
        const serviceCache = new Map<string, ServiceLite>()
        const servicePackageCache = new Map<string, ServicePackageLite>()

        await Promise.all([
          ...serviceIds.map(async (sid) => {
            try {
              const sres = await ServiceApi.getServiceById(sid)
              const raw = sres?.data as unknown as Record<string, unknown>
              const getProp = (o: unknown, key: string) => (o && typeof o === 'object' && key in (o as Record<string, unknown>) ? (o as Record<string, unknown>)[key] : undefined)
              const svcObj = (raw && (raw as Record<string, unknown>).name)
                ? raw
                : (getProp(raw, 'service') || getProp(getProp(raw, 'data'), 'service') || getProp(raw, 'data') || undefined)
              if (svcObj && typeof svcObj === 'object') {
                const so = svcObj as Record<string, unknown>
                serviceCache.set(sid, {
                  name: (so.name as string | undefined),
                  description: (so.description as string | undefined),
                  vehicleCategory: (so.vehicleCategory as string | undefined),
                  price: (so.price as number | undefined),
                })
              } else {
                serviceCache.set(sid, undefined)
              }
            } catch {
              serviceCache.set(sid, undefined)
            }
          }),
          ...servicePackageIds.map(async (pid) => {
            try {
              const pres = await ServicePackageApi.getServicePackageById(pid)
              const raw = pres?.data as unknown as { name?: string; vehicleCategory?: string; price?: number }
              servicePackageCache.set(pid, raw)
            } catch {
              servicePackageCache.set(pid, undefined)
            }
          })
        ])

        const ui: AppointmentLite[] = source.map((apt: BackendAppointment) => {
          const u = userCache.get(apt.userID || '') || {}
          let descriptionText: string | undefined
          const tags: string[] = []
          let vehicleCategory: string | undefined
          let servicePrice: number | undefined

          const embeddedService = (apt as unknown as { service?: { name?: string; description?: string; vehicleCategory?: string } }).service
          const sid = getServiceId(apt)
          const pid = getServicePackageId(apt)
          if (embeddedService?.name || sid) {
            const svc = embeddedService?.name ? embeddedService : (sid ? serviceCache.get(sid) : undefined)
            descriptionText = svc?.name || 'Dịch vụ'
            vehicleCategory = svc?.vehicleCategory
            servicePrice = (svc as { price?: number } | undefined)?.price
          } else if (pid) {
            const pack = servicePackageCache.get(pid)
            descriptionText = pack?.name || 'Gói dịch vụ'
            vehicleCategory = pack?.vehicleCategory
            servicePrice = (pack as { price?: number } | undefined)?.price
          }
          if (vehicleCategory) {
            tags.push(vehicleCategory === 'MOTOBIKE' ? 'Xe máy' : vehicleCategory === 'CAR' ? 'Ô tô' : vehicleCategory === 'BICYCLE' ? 'Xe đạp' : vehicleCategory)
          }
          return {
            id: String(apt._id || apt.id || ''),
            userID: apt.userID,
            vehicleID: apt.vehicleID,
            customerName: u.fullName || u.userName || `Khách ${String(apt._id || '').slice(-4)}`,
            customerPhone: u.phoneNumber || '—',
            bookingDateISO: apt.bookingDate || undefined,
            dateText: formatDate(apt.bookingDate || ''),
            timeText: formatTime(apt.bookingDate || ''),
            status: apt.status,
            descriptionText,
            tags,
            vehicleCategory,
            kind: pid ? 'package' : 'service',
            servicePrice,
          }
        })
        setAppointments(ui)
      } catch {
        setError('Không thể tải lịch hẹn')
      } finally {
        setLoading(false)
      }
    }
    fetchApts()
  }, [])

  // Load parts when entering step 2 (or on first mount if preferred)
  useEffect(() => {
    const loadParts = async () => {
      try {
        const cacheKey = `${debouncedSearch}|${partsPage}`
        const cached = partsCacheRef.current[cacheKey]
        if (cached && cached.length > 0) {
          setParts(cached)
          setPartsLoading(false)
          return
        }
        setPartsLoading(true)
        const res = await fetchParts({ page: partsPage, limit: partsPageSize, search: debouncedSearch })
        setParts(res.data.parts)
        setPartsTotalPages(res.data.pagination.totalPages)
        partsCacheRef.current[cacheKey] = res.data.parts

        // Prefetch next page to avoid flicker when user clicks next
        const nextPage = partsPage + 1
        if (nextPage <= res.data.pagination.totalPages) {
          const nextKey = `${debouncedSearch}|${nextPage}`
          if (!partsCacheRef.current[nextKey]) {
            fetchParts({ page: nextPage, limit: partsPageSize, search: debouncedSearch })
              .then(r => { partsCacheRef.current[nextKey] = r.data.parts })
              .catch(() => {})
          }
        }
      } catch {
        // ignore
      } finally {
        setPartsLoading(false)
      }
    }
    if (activeStep === 2) {
      loadParts()
    }
  }, [activeStep, partsPage, debouncedSearch])

  // Load vehicle when entering step 3
  useEffect(() => {
    const loadVehicle = async () => {
      if (activeStep === 3 && selectedAppointment?.vehicleID) {
        setVehicleLoading(true)
        try {
          const res = await VehicleApi.getVehicleById(selectedAppointment.vehicleID)
          setVehicle(res.data || null)
        } catch {
          setVehicle(null)
        } finally {
          setVehicleLoading(false)
        }
      } else {
        setVehicle(null)
      }
    }
    loadVehicle()
  }, [activeStep, selectedAppointment?.vehicleID])

  const normalize = (s: string) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim()

  const filteredAppointments = useMemo(() => {
    const q = normalize(searchText)
    const flat = searchText.replace(/\s+/g, '')
    return appointments.filter(a => q === '' || normalize(a.customerName).includes(q) || a.customerPhone.replace(/\s+/g, '').includes(flat))
  }, [appointments, searchText])

  const addPart = (part: PartItem) => {
    setCartLines(prev => {
      const idx = prev.findIndex(l => l.part.id === part.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], quantity: Math.min(copy[idx].quantity + 1, 99) }
        return copy
      }
      return [...prev, { part, quantity: 1 }]
    })
  }

  const updateQty = (partId: string, qty: number) => {
    setCartLines(prev => prev.map(l => l.part.id === partId ? { ...l, quantity: Math.max(1, Math.min(qty, 99)) } : l))
  }

  const removeLine = (partId: string) => {
    setCartLines(prev => prev.filter(l => l.part.id !== partId))
  }

  const canProceedStep1 = !!selectedAppointment
  const canProceedStep2 = true // optional; allow continue even with empty cart
  const canProceedStep3 = paymentMethod !== ''

  const handlePay = async () => {
    if (!selectedAppointment) {
      setError('Vui lòng chọn lịch hẹn')
      return
    }

    setIsPaying(true)
    setError('')

    try {
      if (paymentMethod === 'CASH') {
        // Thanh toán tiền mặt - xác nhận ngay
        const res = await PaymentApi.confirmCashPayment({
          appointmentId: selectedAppointment.id,
          amount: grandTotal,
          note: note || undefined,
        })

        if (res.data?.success) {
          setPaymentSuccess(true)
          setActiveStep(4)
        } else {
          setError(res.data?.message || 'Thanh toán thất bại')
          setPaymentSuccess(false)
          setActiveStep(4)
        }
      } else if (paymentMethod === 'PAYOS') {
        // Thanh toán PayOS - tạo payment link và redirect
        // Sử dụng tunnel URL nếu có (cho local development), không thì dùng window.location.origin
        const frontendBaseUrl = import.meta.env.VITE_FRONTEND_BASE_URL || window.location.origin
        const returnUrl = `${frontendBaseUrl}/payment/callback?appointmentId=${selectedAppointment.id}`
        const cancelUrl = `${frontendBaseUrl}/staff/booking`

        const res = await PaymentApi.createPayOSPayment({
          appointmentId: selectedAppointment.id,
          amount: grandTotal,
          description: `Thanh toán dịch vụ: ${selectedAppointment.descriptionText || 'Dịch vụ'}`,
          returnUrl,
          cancelUrl,
          note: note || undefined,
        })

        if (res.data?.success && res.data.data?.checkoutUrl) {
          // Redirect đến PayOS checkout page
          window.location.href = res.data.data.checkoutUrl
        } else {
          setError(res.data?.message || 'Không thể tạo liên kết thanh toán')
          setIsPaying(false)
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra khi thanh toán'
      setError(errorMessage)
      setPaymentSuccess(false)
      setActiveStep(4)
      setIsPaying(false)
    }
  }

  const resetFlow = () => {
    setActiveStep(1)
    setSelectedAppointment(null)
    setCartLines([])
    setPaymentMethod('')
    setNote('')
    setPaymentSuccess(null)
  }

  const Stepper = () => {
    const steps = [
      { k: 1 as StepKey, label: 'Chọn lịch hẹn' },
      { k: 2 as StepKey, label: 'Chọn linh kiện (tuỳ chọn)' },
      { k: 3 as StepKey, label: 'Hoá đơn & thanh toán' },
      { k: 4 as StepKey, label: 'Kết quả' },
    ]
    return (
      <div className="w-full flex items-center justify-center py-2">
        <div className="flex items-center justify-center gap-3">
          {steps.map((s, idx) => {
            const isDone = activeStep > s.k
            const isActive = activeStep === s.k
            const circleCls = isActive || isDone ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
            const labelCls = isActive ? 'text-gray-900' : 'text-gray-600'
            return (
              <React.Fragment key={s.k}>
                <div className="flex flex-col items-center min-w-[120px]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${circleCls}`}>{s.k}</div>
                  <div className={`mt-1 text-xs font-medium text-center ${labelCls}`}>{s.label}</div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-16 sm:w-24 md:w-32 h-1 rounded-full overflow-hidden bg-gray-200">
                    <div className={`${activeStep > s.k ? 'w-full bg-orange-400' : 'w-0'} h-full transition-all`}></div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }

  const Step1 = () => (
    <div className="p-1">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold" style={{ color: '#014091' }}>Tìm lịch hẹn hôm nay</h2>
      </div>

      {/* Search by name/phone */}
      <div className="mb-3">
        <div className="relative">
          <input
            ref={searchInputRef}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value)
              // Ensure input keeps focus after re-render
              requestAnimationFrame(() => searchInputRef.current?.focus())
            }}
            placeholder="Nhập tên khách hoặc số điện thoại..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Results - Card style like ManageAppointment */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {loading && <div className="text-sm text-gray-600">Đang tải...</div>}
        {!loading && filteredAppointments.map((apt) => {
          const statusToColor: Record<string, string> = {
            pending: 'bg-yellow-50',
            confirmed: 'bg-green-50',
            in_progress: 'bg-indigo-50',
            awaiting_payment: 'bg-orange-50',
            completed: 'bg-blue-50',
            cancelled: 'bg-pink-50',
            no_show: 'bg-purple-50',
            rejected: 'bg-pink-50',
          }
          const colorClass = statusToColor[String(apt.status || '')] || 'bg-orange-50'
          return (
            <div
              key={apt.id}
              onClick={() => setSelectedAppointment(apt)}
              className={`${colorClass} rounded-lg p-3 hover:shadow-md transition-all duration-300 h-45 flex flex-col cursor-pointer ${selectedAppointment?.id === apt.id ? 'ring-2 ring-orange-300' : ''}`}
            >
              <div className="flex items-start justify-between mb-2 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold text-xs shadow-sm">
                    {apt.customerName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 text-xs truncate">{apt.customerName}</h3>
                    <p className="text-xs text-gray-600 truncate">{apt.customerPhone}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-700 mb-2 leading-relaxed truncate flex-shrink-0">
                {apt.descriptionText || 'Lịch hẹn'}
              </p>

              {apt.tags && apt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2 flex-shrink-0">
                  {apt.tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-white bg-opacity-60 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[16ch]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-2 flex-shrink-0">
                <div className="flex items-center text-xs text-gray-600">
                  <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{apt.dateText} - {apt.timeText}</span>
                </div>
              </div>
            </div>
          )
        })}
        {!loading && filteredAppointments.length === 0 && (
          <div className="text-sm text-gray-600">Không tìm thấy lịch hẹn phù hợp</div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button disabled={!canProceedStep1} onClick={() => setActiveStep(2)} className={`px-4 py-2 rounded-lg text-sm ${canProceedStep1 ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Tiếp tục</button>
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  )

  const Step2 = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Parts list */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold" style={{ color: '#014091' }}>Chọn linh kiện (tuỳ chọn)</h3>
            <div className="relative">
              <input
                value={partsSearch}
                onChange={(e) => { setPartsSearch(e.target.value); setPartsPage(1); }}
                placeholder="Tìm theo tên hoặc SKU..."
                className="w-72 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {parts.map(p => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-600">SKU: {p.partNumber}</div>
                    <div className="text-xs text-gray-700 mt-1">Giá: {currency(p.price)} • Trạng thái: {p.status || '—'}</div>
                    <div className="text-xs text-gray-700">Nhà cung ứng: {p.manufacturer || '—'}</div>
                    <div className="text-xs text-gray-700">Bảo hành: {p.warrantyPeriod ? `${p.warrantyPeriod} tháng` : '—'}</div>
                </div>
                <button
                  onClick={() => addPart(p)}
                  className={`px-3 py-1 rounded text-xs bg-gray-800 text-white`}
                >
                  Thêm
                </button>
              </div>
              ))}
            </div>
            {partsLoading && (
              <div className="mt-2 text-xs text-gray-600">Đang tải dữ liệu...</div>
            )}
          </div>

          {/* Pagination - centered, numbered with ellipsis */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setPartsPage(p => Math.max(1, p - 1))}
              disabled={partsPage === 1}
              className="h-8 w-8 flex items-center justify-center rounded-full border text-sm disabled:opacity-40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            {(() => {
              const window = 2
              const pages: (number | string)[] = []
              const push = (v: number | string) => pages.push(v)
              push(1)
              const start = Math.max(2, partsPage - window)
              const end = Math.min(partsTotalPages - 1, partsPage + window)
              if (start > 2) push('...')
              for (let i = start; i <= end; i++) push(i)
              if (end < partsTotalPages - 1) push('...')
              if (partsTotalPages > 1) push(partsTotalPages)
              return (
                <>
                  {pages.map((p, idx) => (
                    typeof p === 'number' ? (
                      <button
                        key={idx}
                        onClick={() => setPartsPage(p)}
                        className={`h-8 w-8 flex items-center justify-center rounded-full text-sm ${p === partsPage ? 'bg-gray-900 text-white' : 'border'}`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={`e-${idx}`} className="px-2 text-sm text-gray-600">{p}</span>
                    )
                  ))}
                </>
              )
            })()}
            <button
              onClick={() => setPartsPage(p => Math.min(partsTotalPages, p + 1))}
              disabled={partsPage >= partsTotalPages}
              className="h-8 w-8 flex items-center justify-center rounded-full border text-sm disabled:opacity-40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <div className="ml-3 flex items-center gap-1">
              <span className="text-xs text-gray-600">Tới trang</span>
              <input
                value={partsGoTo}
                onChange={(e) => setPartsGoTo(e.target.value)}
                className="w-12 h-8 border rounded px-2 text-sm"
              />
              <button
                onClick={() => {
                  const v = Math.max(1, Math.min(partsTotalPages, parseInt(partsGoTo || '0', 10) || 1))
                  setPartsPage(v)
                }}
                className="h-8 w-8 flex items-center justify-center rounded border text-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Cart summary */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h4 className="text-sm font-semibold mb-2 text-gray-800">Giỏ linh kiện</h4>
          <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
            {cartLines.length === 0 && <div className="text-xs text-gray-600">Chưa chọn linh kiện nào</div>}
            {cartLines.map(l => (
              <div key={l.part.id} className="border rounded p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{l.part.name}</div>
                    <div className="text-xs text-gray-600">{currency(l.part.price)}</div>
                  </div>
                  <button onClick={() => removeLine(l.part.id)} className="text-xs text-red-600">Xoá</button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-600">SL</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={l.quantity}
                    onChange={(e) => updateQty(l.part.id, Number(e.target.value))}
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                  <div className="ml-auto text-xs text-gray-700">Thành tiền: <span className="font-semibold">{currency(l.part.price * l.quantity)}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t pt-2 text-sm">
            <div className="flex items-center justify-between"><span>Tạm tính linh kiện</span><span className="font-semibold">{currency(partsTotal)}</span></div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button onClick={() => setCartLines([])} className="px-3 py-2 border rounded text-sm">Xoá giỏ</button>
            <div className="flex gap-2">
              <button onClick={() => setActiveStep(1)} className="px-3 py-2 border rounded text-sm">Quay lại</button>
              <button disabled={!canProceedStep2} onClick={() => setActiveStep(3)} className={`px-3 py-2 rounded text-sm ${canProceedStep2 ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Tiếp tục</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const Step3 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-start">
      {/* Invoice */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-3 min-h-[520px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold" style={{ color: '#014091' }}>Hoá đơn</h3>
          {selectedAppointment && (
            <div className="text-xs text-gray-600">Khách: <span className="font-semibold text-gray-800">{selectedAppointment.customerName}</span> • {selectedAppointment.customerPhone}</div>
          )}
        </div>

        <div className="space-y-2">
          <div className="border rounded p-2">
            <div className="text-sm font-semibold text-gray-900">Phí dịch vụ</div>
            <div className="text-xs text-gray-600">
              Dịch vụ: <span className="font-medium">{selectedAppointment?.descriptionText || '—'}</span>
              {selectedAppointment?.vehicleCategory ? ` • ${selectedAppointment.vehicleCategory}` : ''}
              <span className="ml-2">— Tạm tính: {currency(serviceFee)}</span>
            </div>
            {selectedAppointment && (
              <div className="text-xs text-gray-600 mt-1">Thời gian: {selectedAppointment.dateText} {selectedAppointment.timeText}</div>
            )}
          </div>

          {/* Vehicle Information */}
          {vehicleLoading ? (
            <div className="border rounded p-2">
              <div className="text-sm font-semibold text-gray-900 mb-1">Thông tin xe</div>
              <div className="text-xs text-gray-600">Đang tải...</div>
            </div>
          ) : vehicle ? (
            <div className="border rounded p-2">
              <div className="text-sm font-semibold text-gray-900 mb-2">Thông tin xe</div>
              <div className="border-l-2 border-blue-300 pl-2 space-y-1">
                {(() => {
                  const categoryLabel = vehicle.vehicleCategory === 'CAR' ? 'Ô tô' : vehicle.vehicleCategory === 'MOTOBIKE' ? 'Xe máy' : vehicle.vehicleCategory === 'BICYCLE' ? 'Xe đạp' : vehicle.vehicleCategory
                  return (
                    <>
                      <div className="text-xs font-medium text-gray-800">{vehicle.brand} • {categoryLabel}</div>
                      <div className="text-xs text-gray-600">Biển số: {vehicle.plateNumber}</div>
                      <div className="text-xs text-gray-600">VIN: {vehicle.VIN}</div>
                      <div className="text-xs text-gray-600">Năm: {vehicle.year} • Số km: {vehicle.mileage.toLocaleString('vi-VN')}</div>
                      <div className="text-xs text-gray-600">Dung lượng pin: {vehicle.batteryCapacity} Ah</div>
                      <div className="text-xs text-gray-600">Trạng thái: <span className={vehicle.status === 'active' ? 'text-green-600' : vehicle.status === 'maintenance' ? 'text-orange-600' : 'text-gray-600'}>{vehicle.status === 'active' ? 'Đang hoạt động' : vehicle.status === 'maintenance' ? 'Bảo trì' : vehicle.status === 'inactive' ? 'Không hoạt động' : 'Đã nghỉ'}</span></div>
                    </>
                  )
                })()}
              </div>
            </div>
          ) : null}

          <div className="border rounded p-2">
            <div className="text-sm font-semibold text-gray-900 mb-1">Linh kiện</div>
            {cartLines.length === 0 ? (
              <div className="text-xs text-gray-600">Không có</div>
            ) : (
              <div className="space-y-1">
                {cartLines.map(l => (
                  <div key={l.part.id} className="flex items-center justify-between text-xs">
                    <div className="truncate mr-2">{l.part.name} × {l.quantity}</div>
                    <div className="font-medium">{currency(l.part.price * l.quantity)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-sm">
            <div className="flex items-center justify-between"><span>Tạm tính</span><span className="font-semibold">{currency(serviceFee + partsTotal)}</span></div>
            <div className="flex items-center justify-between mt-1 text-gray-700"><span>Giảm giá</span><span>0 ₫</span></div>
            <div className="flex items-center justify-between mt-2 text-base font-bold"><span>Tổng thanh toán</span><span style={{ color: '#014091' }}>{currency(grandTotal)}</span></div>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-lg shadow-sm p-3 min-h-[520px]">
        <h4 className="text-sm font-semibold mb-2 text-gray-800">Phương thức thanh toán</h4>
        <div className="space-y-2">
          {([
            { key: 'CASH', label: 'Tiền mặt' },
            { key: 'PAYOS', label: 'PayOS' },
          ] as const).map(m => (
            <label key={m.key} className={`flex items-center justify-between border rounded p-2 cursor-pointer ${paymentMethod === m.key ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'}`}>
              <div className="text-sm text-gray-800">{m.label}</div>
              <input type="radio" name="pm" checked={paymentMethod === m.key} onChange={() => setPaymentMethod(m.key)} />
            </label>
          ))}
        </div>

        <div className="mt-3">
          <label className="text-xs text-gray-600">Ghi chú</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-1 w-full border rounded p-2 text-sm" placeholder="Thông tin bổ sung..." />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button onClick={() => setActiveStep(2)} className="px-3 py-2 border rounded text-sm">Quay lại</button>
          <button disabled={!canProceedStep3 || isPaying || grandTotal <= 0} onClick={handlePay} className={`px-4 py-2 rounded text-sm ${(!canProceedStep3 || isPaying || grandTotal <= 0) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white'}`}>{isPaying ? 'Đang thanh toán...' : 'Thanh toán'}</button>
        </div>
        {grandTotal <= 0 && <div className="mt-2 text-xs text-gray-500">Tổng tiền đang là 0. Thêm linh kiện hoặc cấu hình phí dịch vụ.</div>}
      </div>
    </div>
  )

  const Step4 = () => {
    const now = new Date()
    const billId = `#BILL${String(now.getTime()).slice(-6)}`
    const pmLabel = paymentMethod === 'CASH' ? 'Tiền mặt' : paymentMethod === 'PAYOS' ? 'PayOS' : '—'
    return (
      <div className="flex items-start justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${paymentSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
              {paymentSuccess ? (
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <div className="mt-3 text-lg font-semibold text-gray-900">{paymentSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: '#014091' }}>{currency(grandTotal)}</div>
            <div className="mt-1 text-xs text-gray-600">{now.toLocaleDateString('vi-VN')} · Mã hóa đơn: {billId}</div>
          </div>

          {/* Payment details */}
          <div className="mt-5 border rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b text-sm font-semibold text-gray-800">Chi tiết thanh toán</div>
            <div className="divide-y">
              <div className="px-4 py-3 text-sm flex items-center justify-between">
                <div className="text-gray-700">Dịch vụ (1)</div>
                <div className="font-medium">{currency(serviceFee)}</div>
              </div>
              <div className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-gray-700">Linh kiện ({cartLines.length})</div>
                  <div className="font-medium">{currency(partsTotal)}</div>
                </div>
                {cartLines.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600 space-y-1 max-h-28 overflow-auto pr-1">
                    {cartLines.map((l) => (
                      <li key={l.part.id} className="flex items-center justify-between">
                        <span className="truncate mr-2">{l.part.name} × {l.quantity}</span>
                        <span className="whitespace-nowrap">{currency(l.part.price * l.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="px-4 py-3 text-sm">
                <div className="text-gray-500 mb-1">Chi tiết giao dịch</div>
                <div className="flex items-center justify-between"><span className="text-gray-600">Đã thanh toán</span><span className="font-medium">{currency(grandTotal)}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-600">Tiền thừa</span><span className="font-medium">{currency(0)}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-600">Phương thức</span><span className="font-medium">{pmLabel}</span></div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button onClick={() => setActiveStep(3)} className="px-4 py-2 border rounded">Quay lại</button>
            <button onClick={resetFlow} className="px-4 py-2 rounded text-white" style={{ backgroundColor: '#014091' }}>Tạo giao dịch mới</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-7 pb-8">
      <div className="bg-white rounded-lg shadow-sm p-3">
        <Stepper />
        <div className="mt-2">
          {activeStep === 1 && <Step1 />}
          {activeStep === 2 && <Step2 />}
          {activeStep === 3 && <Step3 />}
          {activeStep === 4 && <Step4 />}
        </div>
      </div>
    </div>
  )
}

export default BookingPage


