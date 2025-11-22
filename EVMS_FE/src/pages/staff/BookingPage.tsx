import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppointmentApi } from '../../api/AppointmentApi'
import { BillApi } from '../../api/BillApi'
import { UserApi } from '../../api/UserApi'
import { ServiceApi } from '../../api/ServiceApi'
import { ServicePackageApi } from '../../api/ServicePackageApi'
import { InventoryApi, type InventoryItemResponse } from '../../api/Inventory'
import { VehicleApi } from '../../api/VehicleApi'
import { PaymentApi } from '../../api/PaymentApi'
import { PartApi } from '../../api/PartApi'
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
  originalPrice?: number // Giá gốc từ service/package
  isPeriodicRecheck?: boolean // Flag lịch tái định kỳ miễn phí
}

type PartItem = Part & { id: string }

type CartLine = {
  part: PartItem
  quantity: number
}

// No mock data; real data will be fetched from BE

const currency = (v: number) => (v || 0).toLocaleString('vi-VN') + ' ₫'

type ServiceLikeInfo = {
  name?: string
  description?: string
  vehicleCategory?: string
  price?: number
  periodicEnabled?: boolean
}

type ServiceDetailPayload = {
  type: 'service' | 'servicePackage'
  service?: ServiceLikeInfo | null
  servicePackage?: ServiceLikeInfo | null
}

const normalizeServiceLike = (input: unknown): ServiceLikeInfo | undefined => {
  if (!input || typeof input !== 'object') return undefined
  const obj = input as Record<string, unknown>
  const rawPrice = obj.price
  const parsedPrice =
    typeof rawPrice === 'number'
      ? rawPrice
      : typeof rawPrice === 'string'
        ? Number(rawPrice)
        : undefined

  return {
    name: obj.name as string | undefined,
    description: obj.description as string | undefined,
    vehicleCategory: obj.vehicleCategory as string | undefined,
    price: Number.isFinite(parsedPrice as number) ? (parsedPrice as number) : undefined,
    periodicEnabled: Boolean((obj as { periodicEnabled?: boolean }).periodicEnabled),
  }
}

const mergeAppointmentWithServiceDetail = (
  appointment: AppointmentLite,
  detail: ServiceDetailPayload
): AppointmentLite => {
  let reference: ServiceLikeInfo | undefined
  let kind: AppointmentLite['kind'] = appointment.kind

  if (detail.type === 'service') {
    reference = detail.service || undefined
    kind = 'service'
  } else {
    reference = detail.servicePackage || undefined
    kind = 'package'
  }

  if (!reference) {
    return { ...appointment, kind }
  }

  const derivedOriginalPrice =
    typeof reference.price === 'number'
      ? reference.price
      : appointment.originalPrice

  const periodicFlag =
    appointment.isPeriodicRecheck || Boolean(reference.periodicEnabled)

  const basePrice =
    typeof derivedOriginalPrice === 'number'
      ? derivedOriginalPrice
      : appointment.servicePrice || 0

  const finalServicePrice = periodicFlag ? 0 : basePrice

  return {
    ...appointment,
    descriptionText: reference.name || appointment.descriptionText,
    vehicleCategory: reference.vehicleCategory || appointment.vehicleCategory,
    originalPrice: typeof derivedOriginalPrice === 'number' ? derivedOriginalPrice : appointment.originalPrice,
    isPeriodicRecheck: periodicFlag,
    servicePrice: finalServicePrice,
    kind,
  }
}

const BookingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState<StepKey>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: find appointment
  const [searchText, setSearchText] = useState('')
  const [appointments, setAppointments] = useState<AppointmentLite[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentLite | null>(null)

  // Step 2: parts selection (from Inventories with populated Part)
  const [partsSearch, setPartsSearch] = useState('')
  const [inventoryItems, setInventoryItems] = useState<InventoryItemResponse[]>([])
  const [partsLoading, setPartsLoading] = useState(false)
  // removed debouncedSearch (client-side filtering only)

  // no debounce needed; filtering is client-side
  const [cartLines, setCartLines] = useState<CartLine[]>([])

  // Step 3: payment
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'PAYOS' | ''>('')
  const [note, setNote] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null)
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [billId, setBillId] = useState<string>('')
  const [billNumber, setBillNumber] = useState<string>('')
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const noteTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Derived totals - Tính giá:
  // - Nếu isPeriodicRecheck = true → luôn 0đ (dịch vụ miễn phí, như các trang khác)
  // - Ngược lại ưu tiên originalPrice, fallback sang servicePrice
  const serviceFee = useMemo(() => {
    if (!selectedAppointment) return 0
    // Lịch tái định kỳ miễn phí
    if (selectedAppointment.isPeriodicRecheck) return 0
    // Ngược lại: dùng originalPrice nếu có, fallback servicePrice
    if (typeof selectedAppointment.originalPrice === 'number') {
      return selectedAppointment.originalPrice || 0
    }
    return selectedAppointment.servicePrice || 0
  }, [selectedAppointment])
  const partsTotal = useMemo(() => cartLines.reduce((sum, l) => sum + l.part.price * l.quantity, 0), [cartLines])
  const grandTotal = serviceFee + partsTotal

  // Fetch appointments function - can be called multiple times
  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await AppointmentApi.getTodayAwaitingPayment()
        type BackendAppointment = { _id?: string; id?: string; userID?: string; vehicleID?: string; bookingDate?: string; status?: string; serviceID?: unknown; serviceId?: unknown; service?: unknown; servicePackageID?: unknown; servicePackageId?: unknown; servicePackage?: unknown; isPeriodicRecheck?: boolean | string }
      const list = (res?.data?.data || []) as BackendAppointment[]
      // Build minimal list; enrich with user name/phone
      const uniqueUserIds = Array.from(new Set(list.map(a => a.userID).filter((id): id is string => Boolean(id))))
      const userCache = new Map<string, { fullName?: string; userName?: string; phoneNumber?: string }>()
      await Promise.all(uniqueUserIds.map(async (uid: string) => {
        try {
          const ures = await UserApi.getById(uid)
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

      // Helper to get isPeriodicRecheck from appointment
      const getIsPeriodicRecheck = (a: BackendAppointment): boolean => {
        const raw = (a as unknown as Record<string, unknown>).isPeriodicRecheck
        return raw === true || raw === 'true'
      }

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

      type ServiceLite = ServiceLikeInfo | undefined
      type ServicePackageLite = ServiceLikeInfo | undefined
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
                periodicEnabled: Boolean((so as { periodicEnabled?: boolean }).periodicEnabled),
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
            const raw = pres?.data as unknown as Record<string, unknown>
            const getProp = (o: unknown, key: string) => (o && typeof o === 'object' && key in (o as Record<string, unknown>) ? (o as Record<string, unknown>)[key] : undefined)
            const packObj = (raw && (raw as Record<string, unknown>).name)
              ? raw
              : (getProp(raw, 'servicePackage') || getProp(getProp(raw, 'data'), 'servicePackage') || getProp(raw, 'data') || undefined)
            if (packObj && typeof packObj === 'object') {
              const po = packObj as Record<string, unknown>
              servicePackageCache.set(pid, {
                name: po.name as string | undefined,
                vehicleCategory: po.vehicleCategory as string | undefined,
                price: po.price as number | undefined,
                periodicEnabled: Boolean((po as { periodicEnabled?: boolean }).periodicEnabled),
              })
            } else {
              servicePackageCache.set(pid, undefined)
            }
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
        let originalPrice: number | undefined
        let isPeriodicCalculated = getIsPeriodicRecheck(apt)

        const embeddedService = (apt as unknown as { service?: ServiceLikeInfo }).service
        const sid = getServiceId(apt)
        const pid = getServicePackageId(apt)
        const embeddedServicePeriodic = Boolean((embeddedService as ServiceLikeInfo | undefined)?.periodicEnabled)

        if (embeddedService?.name || sid) {
          const svc = embeddedService?.name ? embeddedService : (sid ? serviceCache.get(sid) : undefined)
          descriptionText = svc?.name || 'Dịch vụ'
          vehicleCategory = svc?.vehicleCategory
          originalPrice = svc?.price
          const svcPeriodic = Boolean(svc?.periodicEnabled)
          const finalIsPeriodic = isPeriodicCalculated || embeddedServicePeriodic || svcPeriodic
          servicePrice = finalIsPeriodic ? 0 : originalPrice
          isPeriodicCalculated = finalIsPeriodic
        } else if (pid) {
          const pack = servicePackageCache.get(pid)
          descriptionText = pack?.name || 'Gói dịch vụ'
          vehicleCategory = pack?.vehicleCategory
          originalPrice = pack?.price
          const packPeriodic = Boolean(pack?.periodicEnabled)
          const finalIsPeriodic = getIsPeriodicRecheck(apt) || packPeriodic
          servicePrice = finalIsPeriodic ? 0 : originalPrice
          isPeriodicCalculated = finalIsPeriodic
        }
        if (typeof servicePrice !== 'number') {
          const fallbackPrice = typeof originalPrice === 'number' ? originalPrice : 0
          servicePrice = isPeriodicCalculated ? 0 : fallbackPrice
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
          originalPrice,
          isPeriodicRecheck: isPeriodicCalculated,
        }
      })
      setAppointments(ui)
    } catch {
      setError('Không thể tải lịch hẹn')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Load inventories with parts when entering step 2
  useEffect(() => {
    const loadInventories = async () => {
      try {
        setPartsLoading(true)
        const res = await InventoryApi.getWithParts({})
        setInventoryItems(res.items || [])
      } catch {
        setInventoryItems([])
      } finally {
        setPartsLoading(false)
      }
    }
    if (activeStep === 2) {
      loadInventories()
    }
  }, [activeStep])

  // Handle payment callback from PayOS
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    const paymentSuccessParam = searchParams.get('paymentSuccess')
    const paymentFailedParam = searchParams.get('paymentFailed')
    const paymentCanceledParam = searchParams.get('paymentCanceled')
    const appointmentIdParam = searchParams.get('appointmentId')
    const billIdParam = searchParams.get('billId')

    // Reset isPaying khi component mount hoặc khi có callback (tránh stuck state)
    setIsPaying(false)

    // Check localStorage for payment success info
    const paymentInfoStr = localStorage.getItem('paymentSuccess')
    
    if (paymentSuccessParam === 'true' || paymentInfoStr) {
      // Payment successful - restore state and show step 4
      let paymentInfo: { appointmentId?: string; billId?: string; billNumber?: string; paymentMethod?: string } = {}
      
      if (paymentInfoStr) {
        try {
          paymentInfo = JSON.parse(paymentInfoStr)
          // Clear localStorage after reading
          localStorage.removeItem('paymentSuccess')
        } catch (e) {
          console.error('Failed to parse payment info:', e)
        }
      }

      const finalAppointmentId = appointmentIdParam || paymentInfo.appointmentId
      const finalBillId = billIdParam || paymentInfo.billId

      if (finalAppointmentId) {
        // Find and select the appointment
        const appointment = appointments.find(a => a.id === finalAppointmentId)
        if (appointment) {
          // Luôn cố gắng đồng bộ lại cờ isPeriodicRecheck từ BE
          AppointmentApi.getAppointmentById(finalAppointmentId)
            .then((detailRes) => {
              type AppointmentDetailPayload = {
                isPeriodicRecheck?: boolean | string;
              };

              type AppointmentDetailResponseShape = {
                data?: AppointmentDetailPayload;
              } | AppointmentDetailPayload;

              const detail = detailRes as unknown as AppointmentDetailResponseShape;
              const raw: AppointmentDetailPayload | undefined =
                'data' in detail && detail.data
                  ? detail.data
                  : (detail as AppointmentDetailPayload);

              if (raw && typeof raw.isPeriodicRecheck !== 'undefined') {
                const isPeriodic =
                  raw.isPeriodicRecheck === true ||
                  raw.isPeriodicRecheck === 'true';
                if (isPeriodic !== appointment.isPeriodicRecheck) {
                  // Cập nhật lại selectedAppointment nếu vẫn đang xem đúng appointment đó
                  setSelectedAppointment((prev) => {
                    if (!prev || prev.id !== finalAppointmentId) return prev
                    const updated: AppointmentLite = {
                      ...prev,
                      isPeriodicRecheck: isPeriodic,
                      // Nếu là tái định kỳ → dịch vụ miễn phí
                      servicePrice: isPeriodic ? 0 : prev.servicePrice,
                    }
                    return updated
                  })
                }
              }
            })
            .catch((e: unknown) => {
              console.error('❌ Failed to sync isPeriodicRecheck from getAppointmentById:', e)
            })

          // Nếu appointment không có servicePrice, fetch lại bằng getServiceByAppointmentId
          const finalAppointment = appointment
          if (!appointment.servicePrice && (appointment.kind === 'service' || appointment.kind === 'package')) {
            AppointmentApi.getServiceByAppointmentId(finalAppointmentId).then((serviceRes) => {
              if (serviceRes.data?.success && serviceRes.data.data) {
                const { type, service, servicePackage } = serviceRes.data.data
                const detailPayload: ServiceDetailPayload = {
                  type,
                  service: normalizeServiceLike(service),
                  servicePackage: normalizeServiceLike(servicePackage),
                }
                const updatedAppointment = mergeAppointmentWithServiceDetail(appointment, detailPayload)
                setSelectedAppointment(updatedAppointment)
              }
            }).catch((e: unknown) => {
              console.error('❌ Failed to fetch service for appointment:', e)
            })
          }
          
          setSelectedAppointment(finalAppointment)
          setPaymentMethod(paymentInfo.paymentMethod as 'PAYOS' || 'PAYOS')
          setPaymentSuccess(true)
          
          if (finalBillId) {
            setBillId(finalBillId)
            // Fetch bill to get billNumber and restore cartLines
            BillApi.getById(finalBillId).then(async (res) => {
              console.log('📄 Bill response:', res.data)
              if (res.data?.data) {
                const bill = res.data.data
                console.log('📄 Bill data:', bill)
                if (bill.billNumber) {
                  setBillNumber(bill.billNumber)
                  console.log('✅ Bill number set:', bill.billNumber)
                }
                
                // Fetch service từ appointmentID trong bill
                if (bill.appointmentID) {
                  const appointmentIdStr = typeof bill.appointmentID === 'string' 
                    ? bill.appointmentID 
                    : (bill.appointmentID as { toString?: () => string; _id?: string })?.toString?.() 
                      || (bill.appointmentID as { _id?: string })?._id 
                      || String(bill.appointmentID)
                  
                  console.log('🔍 Fetching service from appointmentID:', appointmentIdStr)
                  try {
                    const serviceRes = await AppointmentApi.getServiceByAppointmentId(appointmentIdStr)
                    if (serviceRes.data?.success && serviceRes.data.data && finalAppointment) {
                      const { type, service, servicePackage } = serviceRes.data.data
                      const detailPayload: ServiceDetailPayload = {
                        type,
                        service: normalizeServiceLike(service),
                        servicePackage: normalizeServiceLike(servicePackage),
                      }
                      setSelectedAppointment(mergeAppointmentWithServiceDetail(finalAppointment, detailPayload))
                    }
                  } catch (e) {
                    console.error('❌ Failed to fetch service from appointmentID:', e)
                  }
                }
                
                // Restore cartLines from bill items
                if (bill.items && Array.isArray(bill.items) && bill.items.length > 0) {
                  console.log('📦 Restoring cartLines from bill items:', bill.items.length, 'items')
                  try {
                    // Fetch parts to populate cartLines
                    const partIds = bill.items.map((item: { partID?: string | { toString?: () => string } }) => {
                      // partID có thể là ObjectId hoặc string
                      const pid = item.partID
                      if (!pid) return null
                      return typeof pid === 'string' ? pid : (pid as unknown as { toString?: () => string })?.toString?.() || String(pid)
                    }).filter((id): id is string => Boolean(id))
                    console.log('📦 Part IDs to fetch:', partIds)
                    const partsMap = new Map<string, PartItem>()
                    
                    // Fetch each part (you might want to optimize this with a batch API)
                    await Promise.all(partIds.map(async (partId: string) => {
                      try {
                        const partRes = await PartApi.getPartById(partId)
                        if (partRes.data?.part) {
                          const raw = partRes.data.part as Part
                          partsMap.set(partId, { ...raw, id: String(raw._id) })
                          console.log(`✅ Fetched part ${partId}:`, partRes.data.part.name)
                        }
                      } catch (e) {
                        console.error(`❌ Failed to fetch part ${partId}:`, e)
                      }
                    }))
                    
                    // Rebuild cartLines from bill items
                    const restoredCartLines: CartLine[] = bill.items
                      .map((item: { partID?: string | { toString?: () => string; _id?: string | { toString?: () => string } }; quantity?: number }) => {
                        const pid = item.partID
                        let partIdStr = ''
                        if (typeof pid === 'string') {
                          partIdStr = pid
                        } else if (pid) {
                          // ObjectId có thể có _id hoặc toString
                          const obj = pid as { toString?: () => string; _id?: string | { toString?: () => string } }
                          if (obj._id) {
                            partIdStr = typeof obj._id === 'string' ? obj._id : obj._id.toString?.() || String(obj._id)
                          } else {
                            partIdStr = obj.toString?.() || String(pid)
                          }
                        }
                        if (!partIdStr) {
                          console.warn('⚠️ Invalid partID:', pid)
                          return null
                        }
                        // Try to find part by exact match or by comparing all keys
                        let part = partsMap.get(partIdStr)
                        if (!part) {
                          // Try to find by comparing all part IDs in map
                          for (const [key, value] of partsMap.entries()) {
                            if (key === partIdStr || String(key) === String(partIdStr) || value.id === partIdStr) {
                              part = value
                              break
                            }
                          }
                        }
                        if (part) {
                          return {
                            part,
                            quantity: item.quantity || 1,
                          }
                        }
                        console.warn('⚠️ Part not found for partID:', partIdStr, 'Available parts:', Array.from(partsMap.keys()))
                        return null
                      })
                      .filter((line): line is CartLine => line !== null)
                    
                    console.log('✅ Restored cartLines:', restoredCartLines.length, 'items')
                    setCartLines(restoredCartLines)
                  } catch (e) {
                    console.error('❌ Failed to restore cartLines:', e)
                  }
                } else {
                  console.log('ℹ️ Bill has no items or items is empty')
                }
              }
            }).catch((e: unknown) => {
              console.error('❌ Failed to fetch bill:', e)
            })
          } else if (paymentInfo.billNumber) {
            setBillNumber(paymentInfo.billNumber)
          }
          
          console.log('📊 State before step 4:')
          console.log('- selectedAppointment:', selectedAppointment)
          console.log('- serviceFee:', serviceFee)
          console.log('- cartLines:', cartLines.length)
          console.log('- partsTotal:', partsTotal)
          console.log('- grandTotal:', grandTotal)
          console.log('- billNumber:', billNumber)
          console.log('- billId:', billId)
          
          setActiveStep(4)
        } else {
          // Appointment not found in current list, try to fetch it with full details
          AppointmentApi.getAppointmentById(finalAppointmentId).then(async (res) => {
            if (res.data) {
              type BackendAppointment = { 
                _id?: string; 
                id?: string; 
                userID?: string; 
                vehicleID?: string; 
                bookingDate?: string; 
                status?: string;
                serviceID?: unknown;
                serviceId?: unknown;
                service?: unknown;
                servicePackageID?: unknown;
                servicePackageId?: unknown;
                servicePackage?: unknown;
                isPeriodicRecheck?: boolean | string;
              }
              const apt = res.data as BackendAppointment
              const isPeriodicRecheck = apt.isPeriodicRecheck === true || apt.isPeriodicRecheck === 'true'
              
              // Fetch user info
              let customerName = 'Khách hàng'
              let customerPhone = '—'
              if (apt.userID) {
                try {
                  const userRes = await UserApi.getById(apt.userID)
                  customerName = userRes.data?.fullName || userRes.data?.userName || customerName
                  customerPhone = userRes.data?.phoneNumber || customerPhone
                } catch (e) {
                  console.error('Failed to fetch user:', e)
                }
              }
              
              let newAppointment: AppointmentLite = {
                id: String(apt._id || apt.id || ''),
                userID: apt.userID,
                vehicleID: apt.vehicleID,
                customerName,
                customerPhone,
                bookingDateISO: apt.bookingDate,
                dateText: apt.bookingDate ? new Date(apt.bookingDate).toLocaleDateString('vi-VN') : '',
                timeText: apt.bookingDate ? new Date(apt.bookingDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
                status: apt.status,
                descriptionText: 'Dịch vụ',
                vehicleCategory: undefined,
                kind: 'service',
                servicePrice: undefined,
                originalPrice: undefined,
                isPeriodicRecheck,
              }

              try {
                const appointmentIdStr = String(apt._id || apt.id || '')
                console.log('🔍 Fetching service from appointmentID (not in list):', appointmentIdStr)
                const serviceRes = await AppointmentApi.getServiceByAppointmentId(appointmentIdStr)
                if (serviceRes.data?.success && serviceRes.data.data) {
                  const { type, service, servicePackage } = serviceRes.data.data
                  const detailPayload: ServiceDetailPayload = {
                    type,
                    service: normalizeServiceLike(service),
                    servicePackage: normalizeServiceLike(servicePackage),
                  }
                  newAppointment = mergeAppointmentWithServiceDetail(newAppointment, detailPayload)
                }
              } catch (e) {
                console.error('❌ Failed to fetch service from appointmentID:', e)
              }

              setSelectedAppointment(newAppointment)
              setPaymentMethod('PAYOS')
              setPaymentSuccess(true)
              
              // Fetch bill nếu có billId
              if (finalBillId) {
                setBillId(finalBillId)
                BillApi.getById(finalBillId).then(async (billRes) => {
                  if (billRes.data?.data) {
                    const bill = billRes.data.data
                    if (bill.billNumber) {
                      setBillNumber(bill.billNumber)
                    }
                    
                    // Fetch service từ appointmentID trong bill (nếu chưa có servicePrice)
                    if (bill.appointmentID && !newAppointment.servicePrice) {
                      const appointmentIdStr = typeof bill.appointmentID === 'string' 
                        ? bill.appointmentID 
                        : (bill.appointmentID as { toString?: () => string; _id?: string })?.toString?.() 
                          || (bill.appointmentID as { _id?: string })?._id 
                          || String(bill.appointmentID)
                      
                      console.log('🔍 Fetching service from bill.appointmentID:', appointmentIdStr)
                      try {
                        const serviceRes = await AppointmentApi.getServiceByAppointmentId(appointmentIdStr)
                        if (serviceRes.data?.success && serviceRes.data.data) {
                          const { type, service, servicePackage } = serviceRes.data.data
                          const detailPayload: ServiceDetailPayload = {
                            type,
                            service: normalizeServiceLike(service),
                            servicePackage: normalizeServiceLike(servicePackage),
                          }
                          const enhanced = mergeAppointmentWithServiceDetail(newAppointment, detailPayload)
                          newAppointment = enhanced
                          setSelectedAppointment(enhanced)
                        }
                      } catch (e) {
                        console.error('❌ Failed to fetch service from bill.appointmentID:', e)
                      }
                    }
                    
                    // Restore cartLines from bill items
                    if (bill.items && Array.isArray(bill.items) && bill.items.length > 0) {
                      try {
                        const partIds = bill.items.map((item: { partID?: string | { toString?: () => string; _id?: string | { toString?: () => string } } }) => {
                          const pid = item.partID
                          if (!pid) return null
                          if (typeof pid === 'string') return pid
                          const obj = pid as { toString?: () => string; _id?: string | { toString?: () => string } }
                          if (obj._id) {
                            return typeof obj._id === 'string' ? obj._id : obj._id.toString?.() || String(obj._id)
                          }
                          return obj.toString?.() || String(pid)
                        }).filter((id): id is string => Boolean(id))
                        console.log('📦 Part IDs to fetch (appointment not in list):', partIds)
                        const partsMap = new Map<string, PartItem>()
                        
                        await Promise.all(partIds.map(async (partId: string) => {
                          try {
                            const partRes = await PartApi.getPartById(partId)
                            if (partRes.data?.part) {
                              const raw = partRes.data.part as Part
                              partsMap.set(partId, { ...raw, id: String(raw._id) })
                              console.log(`✅ Fetched part ${partId} (appointment not in list):`, partRes.data.part.name)
                            }
                          } catch (e) {
                            console.error(`❌ Failed to fetch part ${partId}:`, e)
                          }
                        }))
                        
                        const restoredCartLines: CartLine[] = bill.items
                          .map((item: { partID?: string | { toString?: () => string; _id?: string | { toString?: () => string } }; quantity?: number }) => {
                            const pid = item.partID
                            let partIdStr = ''
                            if (typeof pid === 'string') {
                              partIdStr = pid
                            } else if (pid) {
                              // ObjectId có thể có _id hoặc toString
                              const obj = pid as { toString?: () => string; _id?: string | { toString?: () => string } }
                              if (obj._id) {
                                partIdStr = typeof obj._id === 'string' ? obj._id : obj._id.toString?.() || String(obj._id)
                              } else {
                                partIdStr = obj.toString?.() || String(pid)
                              }
                            }
                            if (!partIdStr) {
                              console.warn('⚠️ Invalid partID:', pid)
                              return null
                            }
                            // Try to find part by exact match or by comparing all keys
                            let part = partsMap.get(partIdStr)
                            if (!part) {
                              // Try to find by comparing all part IDs in map
                              for (const [key, value] of partsMap.entries()) {
                                if (key === partIdStr || String(key) === String(partIdStr) || value.id === partIdStr) {
                                  part = value
                                  break
                                }
                              }
                            }
                            if (part) {
                              return {
                                part,
                                quantity: item.quantity || 1,
                              }
                            }
                            console.warn('⚠️ Part not found for partID:', partIdStr, 'Available parts:', Array.from(partsMap.keys()))
                            return null
                          })
                          .filter((line): line is CartLine => line !== null)
                        
                        console.log('✅ Restored cartLines (appointment not in list):', restoredCartLines.length, 'items')
                        setCartLines(restoredCartLines)
                      } catch (e) {
                        console.error('Failed to restore cartLines:', e)
                      }
                    }
                  }
                }).catch((e: unknown) => {
                  console.error('Failed to fetch bill:', e)
                })
              }
              
              setActiveStep(4)
            }
          }).catch((e: unknown) => {
            console.error('Failed to fetch appointment:', e)
          })
        }
      }
      
      // Clear URL params
      setSearchParams({})
    } else if (paymentFailedParam === 'true' || paymentCanceledParam === 'true') {
      // Payment failed or canceled
      setPaymentSuccess(false)
      setActiveStep(4)
      // Clear URL params
      setSearchParams({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, appointments, setSearchParams])

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

  // remove old quick-add (đã thay bằng addPartFromInventory có kiểm soát tồn kho)

  const addPartFromInventory = (inv: InventoryItemResponse) => {
    const p = inv.partID
    const part: PartItem = {
      id: String(p._id),
      name: p.name,
      description: p.description,
      manufacturer: p.manufacturer,
      partNumber: p.partNumber,
      price: p.price,
      status: (p.status === 'inactive' ? 'inactive' : 'active') as PartItem['status'],
      warrantyPeriod: p.warrantyPeriod,
      warrantyCondition: p.warrantyCondition,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    } as unknown as PartItem
    // Chặn vượt quá tồn kho hiện tại
    setCartLines(prev => {
      const idx = prev.findIndex(l => l.part.id === part.id)
      const currentQty = idx >= 0 ? prev[idx].quantity : 0
      if (currentQty >= inv.quantity) {
        setError(`Không thể thêm quá số lượng trong kho. Tối đa ${inv.quantity} sản phẩm cho "${p.name}".`)
        setTimeout(() => setError(''), 3000)
        return prev
      }
      const nextQty = Math.min(currentQty + 1, inv.quantity)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], quantity: nextQty }
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
  const canProceedStep3 = paymentMethod !== '' && !(paymentMethod === 'PAYOS' && note.trim() === '')

  const handlePay = async () => {
    if (!selectedAppointment) {
      setError('Vui lòng chọn lịch hẹn')
      return
    }
    if (paymentMethod === 'PAYOS' && note.trim() === '') {
      setError('Vui lòng nhập mô tả (PayOS yêu cầu).')
      // focus vào textarea mô tả
      requestAnimationFrame(() => noteTextareaRef.current?.focus())
      return
    }

    setIsPaying(true)
    setError('')

    try {
      if (paymentMethod === 'CASH') {
        // 1) Tạo bill pending với items từ cart
        let billId = ''
        try {
          // Chuẩn bị bill items từ cart - chỉ cần partID và quantity
          // Backend sẽ tự động lấy thông tin Part từ database
          const billItems = cartLines.map(line => ({
            partID: line.part.id,
            quantity: line.quantity,
          }))
          const billRes = await BillApi.createBill({
            appointmentID: selectedAppointment.id,
            items: billItems,
            subtotal: serviceFee + partsTotal,
            tax: 0,
            totalAmount: grandTotal,
            description: note || undefined, // Lưu note vào bill description
            paymentMethod: 'CASH',
          })
          billId = billRes.data.bill?._id || ''
          setBillId(billId)
          setBillNumber(billRes.data.bill?.billNumber || '')
        } catch (e) {
          // vẫn cho tiếp tục payment để không kẹt, nhưng log lỗi
          console.error('Create bill failed:', e)
        }

        // 2) Xác nhận thanh toán tiền mặt
        const payRes = await PaymentApi.confirmCashPayment({
          billId: billId,
          note: note || undefined,
        })

        if (payRes.data?.success) {
          // 3) Cập nhật bill sang paid (nếu đã tạo được bill)
          if (billId) {
            try {
              await BillApi.updateBillStatus(billId, 'paid')
            } catch (e) {
              console.error('Update bill status failed:', e)
            }
          }
          setPaymentSuccess(true)
          setIsPaying(false) // Reset isPaying sau khi thanh toán thành công
          setActiveStep(4)
        } else {
          setError(payRes.data?.message || 'Thanh toán thất bại')
          setPaymentSuccess(false)
          setIsPaying(false) // Reset isPaying khi thanh toán thất bại
          setActiveStep(4)
        }
      } else if (paymentMethod === 'PAYOS') {
        // Thanh toán PayOS - tạo payment link và redirect
        // Luôn dùng origin hiện tại để tránh lệch domain/tunnel và mất token; đồng thời loại bỏ double slash
        const origin = window.location.origin.replace(/\/+$/, '')
        const returnUrl = `${origin}/payment/callback?appointmentId=${selectedAppointment.id}`
        const cancelUrl = `${origin}/staff/booking` 

        // Chuẩn bị bill items từ cart - chỉ cần partID và quantity
        // Backend sẽ tự động lấy thông tin Part từ database
        const billItems = cartLines.map(line => ({
          partID: line.part.id,
          quantity: line.quantity,
        }))

        const res = await PaymentApi.createPayOSPayment({
          appointmentId: selectedAppointment.id,
          amount: grandTotal,
          description: `Thanh toán dịch vụ: ${selectedAppointment.descriptionText || 'Dịch vụ'}`,
          returnUrl,
          cancelUrl,
          note: note || undefined,
          // Bill information for PayOS payment
          items: billItems,
          subtotal: serviceFee + partsTotal,
          tax: 0,
          totalAmount: grandTotal,
        })

        if (res.data?.success && res.data.data?.checkoutUrl) {
          // Lưu billId và billNumber nếu có (từ response)
          const paymentData = res.data.data as { checkoutUrl: string; billId?: string; paymentLinkId?: string; qrCode?: string }
          if (paymentData.billId) {
            setBillId(paymentData.billId)
          }
          // Reset isPaying trước khi redirect (vì redirect sẽ mất state)
          setIsPaying(false)
          // Redirect đến PayOS checkout page
          window.location.href = paymentData.checkoutUrl
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
    setBillId('')
    setBillNumber('')
    // Reload appointments list to reflect updated statuses after payment
    fetchAppointments()
  }

  // Handler for note textarea to prevent focus loss
  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation()
    const value = e.target.value
    const cursorPosition = e.target.selectionStart
    setNote(value)
    // Restore focus and cursor position after state update
    requestAnimationFrame(() => {
      if (noteTextareaRef.current) {
        noteTextareaRef.current.focus()
        const newPosition = Math.min(cursorPosition, value.length)
        noteTextareaRef.current.setSelectionRange(newPosition, newPosition)
      }
    })
  }, [])

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
    const q = normalize(partsSearch)
    // Pagination: default 3 rows x 2 columns per page; allow user to change rows per page
    const COLS_PER_ROW = 2
    const [rowsPerPage, setRowsPerPage] = useState(3)
    const [page, setPage] = useState(1)
    const ITEMS_PER_PAGE = rowsPerPage * COLS_PER_ROW

    // Ẩn các item hết hàng (quantity === 0)
    const source = inventoryItems.filter(inv => inv.quantity > 0)
    const filteredInventory = q
      ? source.filter(inv => {
          const p = inv.partID
          return (
            p.name.toLowerCase().includes(q) ||
            (p.partNumber || '').toLowerCase().includes(q) ||
            (p.manufacturer || '').toLowerCase().includes(q)
          )
        })
      : source

    // Reset về trang 1 khi tìm kiếm hoặc danh sách thay đổi / đổi số hàng mỗi trang
    // Chỉ phụ thuộc vào q và rowsPerPage; inventoryItems thay đổi đã được phản ánh qua filteredInventory
    useEffect(() => { setPage(1) }, [q, rowsPerPage])

    const totalPages = Math.max(1, Math.ceil(filteredInventory.length / ITEMS_PER_PAGE))
    const safePage = Math.min(page, totalPages)
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE
    const currentPageItems = filteredInventory.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    // Không dùng badge trạng thái; chỉ hiển thị số lượng nổi bật
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Parts list */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold" style={{ color: '#014091' }}>Chọn linh kiện (tuỳ chọn)</h3>
            <div className="flex items-center gap-2">
              {/* Rows per page selector */}
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600 whitespace-nowrap">Hàng/trang</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
              {/* Page jump */}
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600 whitespace-nowrap">Tới trang</label>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={safePage}
                  onChange={(e) => {
                    const v = Number(e.target.value || 1)
                    const next = Math.max(1, Math.min(v, totalPages))
                    setPage(next)
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
              {/* Search */}
            <div className="relative">
              <input
                value={partsSearch}
                onChange={(e) => { setPartsSearch(e.target.value) }}
                placeholder="Tìm theo tên, mã hoặc NSX..."
                className="w-72 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              </div>
            </div>
          </div>
          {error && (
            <div className="mb-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPageItems.map(inv => (
                <div key={inv._id} className="border border-gray-200 rounded-lg p-3 flex items-start justify-between relative">
                  <div className="min-w-0 pr-16">
                    <div className="text-sm font-semibold text-gray-900 truncate">{inv.partID.name}</div>
                    <div className="mt-0.5 text-xs text-gray-600">Mã: <span className="font-medium">{inv.partID.partNumber || '—'}</span></div>
                    <div className="text-xs text-gray-600">NSX: {inv.partID.manufacturer || '—'}</div>
                    <div className="text-xs text-gray-700 mt-1">Giá: <span className="font-semibold">{currency(inv.partID.price)}</span></div>
                    <div className="text-xs text-gray-700">Danh mục: {inv.partID.category || '—'}</div>
                    <div className="text-xs text-gray-700">Bảo hành: {inv.partID.warrantyPeriod ? `${inv.partID.warrantyPeriod} ${inv.partID.warrantyCondition || 'tháng'}` : '—'}</div>
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    <div className="absolute top-2 right-2">
                      <div className="px-2 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                        {inv.quantity} sản phẩm
                      </div>
                    </div>
                    <button
                      onClick={() => addPartFromInventory(inv)}
                      className={`px-3 py-1 rounded text-xs bg-gray-800 text-white whitespace-nowrap mt-8`}
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-600">Trang {safePage}/{totalPages} • {filteredInventory.length} sản phẩm</div>
              <div className="flex items-center gap-2">
                <button
                  className={`px-2 py-1 border rounded text-xs ${safePage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => safePage > 1 && setPage(safePage - 1)}
                  disabled={safePage <= 1}
                >
                  Trước
                </button>
                <button
                  className={`px-2 py-1 border rounded text-xs ${safePage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => safePage < totalPages && setPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                >
                  Sau
                </button>
              </div>
            </div>

            {partsLoading && (
              <div className="mt-2 text-xs text-gray-600">Đang tải dữ liệu...</div>
            )}
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
                      {vehicle.VIN && (
                        <div className="text-xs text-gray-600">VIN: {vehicle.VIN}</div>
                      )}
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
            <div className="text-sm font-semibold text-gray-900">Phí dịch vụ</div>
            <div className="text-xs text-gray-600">
              Dịch vụ: <span className="font-medium">{selectedAppointment?.descriptionText || '—'}</span>
              {selectedAppointment?.vehicleCategory ? ` • ${selectedAppointment.vehicleCategory}` : ''}
            </div>
            <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
              <span>Tạm tính:</span>
              {selectedAppointment?.isPeriodicRecheck && selectedAppointment?.originalPrice ? (
                <>
                  <span className="text-gray-400 line-through">{currency(selectedAppointment.originalPrice)}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    0đ (Miễn phí)
                  </span>
                </>
              ) : (
                <span className="font-semibold text-orange-600">{currency(serviceFee)}</span>
              )}
            </div>
            {selectedAppointment && (
              <div className="text-xs text-gray-600 mt-1">Thời gian: {selectedAppointment.dateText} {selectedAppointment.timeText}</div>
            )}
          </div>

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
          <textarea 
            ref={noteTextareaRef}
            value={note} 
            onChange={handleNoteChange}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onInput={(e) => e.stopPropagation()}
            rows={3} 
            className="mt-1 w-full border rounded p-2 text-sm resize-none" 
            placeholder="Thông tin bổ sung..."
          />
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
    // Use actual bill number or generate a formatted ID
    const displayBillId = billNumber || billId || `#BILL${String(now.getTime()).slice(-6)}`
    const formattedDate = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    
    // Fireworks Icon Component - Pháo hoa bắn lên (nhỏ hơn)
    const FireworksIcon = () => (
      <div className="relative w-12 h-12 flex items-center justify-center mb-2">
        <svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Central explosion */}
          <circle cx="40" cy="40" r="4" fill="#FFD700"/>
          <circle cx="40" cy="40" r="6" fill="#FFA500" opacity="0.5"/>
          <circle cx="40" cy="40" r="8" fill="#FF6B6B" opacity="0.3"/>
          
          {/* Main radiating lines */}
          <line x1="40" y1="40" x2="40" y2="15" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
          <line x1="40" y1="40" x2="40" y2="65" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round"/>
          <line x1="40" y1="40" x2="15" y2="40" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round"/>
          <line x1="40" y1="40" x2="65" y2="40" stroke="#95E1D3" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Diagonal lines */}
          <line x1="40" y1="40" x2="25" y2="25" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>
          <line x1="40" y1="40" x2="55" y2="55" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round"/>
          <line x1="40" y1="40" x2="55" y2="25" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round"/>
          <line x1="40" y1="40" x2="25" y2="55" stroke="#95E1D3" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Sparkles at line ends */}
          <circle cx="40" cy="15" r="2.5" fill="#FFD700"/>
          <circle cx="40" cy="65" r="2.5" fill="#4ECDC4"/>
          <circle cx="15" cy="40" r="2.5" fill="#FF6B6B"/>
          <circle cx="65" cy="40" r="2.5" fill="#95E1D3"/>
          <circle cx="25" cy="25" r="2" fill="#FFD700"/>
          <circle cx="55" cy="55" r="2" fill="#4ECDC4"/>
          <circle cx="55" cy="25" r="2" fill="#FF6B6B"/>
          <circle cx="25" cy="55" r="2" fill="#95E1D3"/>
          
          {/* Additional small sparkles */}
          <circle cx="40" cy="10" r="1.5" fill="#FF6B6B"/>
          <circle cx="40" cy="70" r="1.5" fill="#4ECDC4"/>
          <circle cx="10" cy="40" r="1.5" fill="#FFD700"/>
          <circle cx="70" cy="40" r="1.5" fill="#FF6B6B"/>
          <circle cx="30" cy="20" r="1" fill="#4ECDC4"/>
          <circle cx="50" cy="60" r="1" fill="#FFD700"/>
          <circle cx="50" cy="20" r="1" fill="#FF6B6B"/>
          <circle cx="30" cy="60" r="1" fill="#4ECDC4"/>
        </svg>
      </div>
    )

    // Dashed line with curved indents on sides (rìa cong vào)
    const DashedLineWithCurves = () => (
      <div className="relative w-full my-2" style={{ height: '16px' }}>
        <svg width="100%" height="16" viewBox="0 0 100 16" preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <pattern id="dash-pattern" x="0" y="0" width="6" height="2" patternUnits="userSpaceOnUse">
              <line x1="0" y1="1" x2="4" y2="1" stroke="#D1D5DB" strokeWidth="1.5"/>
            </pattern>
          </defs>
          {/* Left curved indent - semicircle going inward */}
          <path d="M 0 8 A 4 4 0 0 1 8 8" stroke="#D1D5DB" strokeWidth="1.5" fill="none"/>
          {/* Dashed line in the middle */}
          <rect x="8" y="7.25" width="84" height="1.5" fill="url(#dash-pattern)"/>
          {/* Right curved indent - semicircle going inward */}
          <path d="M 92 8 A 4 4 0 0 0 100 8" stroke="#D1D5DB" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
    )

    // Regular dashed line
    const DashedLine = () => (
      <div className="w-full border-t border-dashed border-gray-300 my-2"></div>
    )

    // Scalloped bottom edge (răng cưa - như vé bị xé)
    const ScallopedEdge = () => (
      <div className="relative w-full" style={{ height: '8px' }}>
        <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none" style={{ display: 'block' }}>
          <path d="M0,8 Q2,5 4,8 Q6,5 8,8 Q10,5 12,8 Q14,5 16,8 Q18,5 20,8 Q22,5 24,8 Q26,5 28,8 Q30,5 32,8 Q34,5 36,8 Q38,5 40,8 Q42,5 44,8 Q46,5 48,8 Q50,5 52,8 Q54,5 56,8 Q58,5 60,8 Q62,5 64,8 Q66,5 68,8 Q70,5 72,8 Q74,5 76,8 Q78,5 80,8 Q82,5 84,8 Q86,5 88,8 Q90,5 92,8 Q94,5 96,8 Q98,5 100,8 L100,8 L0,8 Z" 
                fill="white" stroke="#E5E7EB" strokeWidth="0.5"/>
        </svg>
      </div>
    )

    if (!paymentSuccess) {
      return (
        <div className="flex items-start justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-100">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <div className="mt-3 text-lg font-semibold text-gray-900">Thanh toán thất bại</div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button onClick={() => setActiveStep(3)} className="px-4 py-2 border rounded">Quay lại</button>
                <button onClick={resetFlow} className="px-4 py-2 rounded text-white bg-gray-800">Tạo giao dịch mới</button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-start justify-center p-4 bg-gray-50">
        <div className="w-full max-w-lg">
          {/* Ticket Card - Rectangle shape */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
            {/* Success Header Section */}
            <div className="flex flex-col items-center text-center pt-5 pb-2 px-6">
              <FireworksIcon />
              <h1 className="text-xl font-bold text-gray-900 mb-1">Thanh toán thành công</h1>
              
              {/* Large prominent price */}
              <div className="text-3xl font-bold mb-2" style={{ color: '#014091' }}>
                {currency(grandTotal)}
              </div>
              
              {/* Small date and bill ID */}
              <div className="text-xs text-gray-500 mb-2">
                {formattedDate} • Mã hóa đơn: {displayBillId}
              </div>
              
              {/* Dashed line with curved indents */}
              <DashedLineWithCurves />
            </div>

            {/* Payment Details Section */}
            <div className="px-6 pb-3">
              <div className="text-sm font-semibold text-gray-900 mb-2">Chi tiết thanh toán</div>
              
              {/* Service fee */}
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-700">Dịch vụ ({serviceFee > 0 ? 1 : 0})</span>
                <span className="font-medium text-gray-900">{currency(serviceFee)}</span>
              </div>
              
              {/* Parts total */}
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-700">Linh kiện ({cartLines.length})</span>
                <span className="font-medium text-gray-900">{currency(partsTotal)}</span>
              </div>
              
              {/* Individual parts list */}
              {cartLines.length > 0 && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {cartLines.map(l => (
                    <div key={l.part.id} className="flex items-center justify-between text-xs text-gray-600">
                      <span className="truncate mr-2">{l.part.name} × {l.quantity}</span>
                      <span className="font-medium whitespace-nowrap">{currency(l.part.price * l.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Regular dashed line */}
              <DashedLine />
              
              {/* Transaction Details */}
              <div className="text-sm font-semibold text-gray-900 mb-2">Chi tiết giao dịch</div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Đã thanh toán</span>
                  <span className="font-medium text-gray-900">{currency(grandTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tiền thừa</span>
                  <span className="font-medium text-gray-900">{currency(0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Phương thức</span>
                  <span className="font-medium text-gray-900">
                    {paymentMethod === 'CASH' ? 'Tiền mặt' : paymentMethod === 'PAYOS' ? 'PayOS' : '—'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Scalloped bottom edge */}
            <ScallopedEdge />
          </div>

          {/* Action Button */}
          <div className="mt-6 flex items-center justify-center">
            <button 
              onClick={resetFlow} 
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors shadow-md"
              style={{ backgroundColor: '#014091' }}
            >
              Tạo giao dịch mới
            </button>
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


