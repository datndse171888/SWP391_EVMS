import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { PaymentApi } from '../../api/PaymentApi'
import { BillApi } from '../../api/BillApi'

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('')

  const appointmentId = searchParams.get('appointmentId')
  // PayOS có thể gửi paymentLinkId hoặc code (orderCode) hoặc id trong URL
  const paymentLinkId = searchParams.get('paymentLinkId') || searchParams.get('id') || searchParams.get('code') || searchParams.get('orderCode')
  const cancelParam = searchParams.get('cancel')
  const statusParam = searchParams.get('status')

  useEffect(() => {
    const confirmPayment = async () => {
      // Log toàn bộ query để debug flicker
      console.log('[PaymentCallback] query:', {
        appointmentId,
        paymentLinkId,
        cancelParam,
        statusParam,
        location: window.location.href,
      })

      // Chỉ coi là hủy khi cancelParam=true; các status khác (PENDING, etc.) vẫn tiến hành confirm trên server
      if (cancelParam === 'true') {
        setStatus('failed')
        setMessage('Thanh toán đã bị hủy')
        setTimeout(() => {
          navigate('/staff/booking?paymentCanceled=true')
        }, 800)
        return
      }

      if (!appointmentId) {
        setStatus('failed')
        setMessage('Thiếu thông tin appointment')
        setTimeout(() => {
          navigate('/staff/booking')
        }, 800)
        return
      }

      if (paymentLinkId) {
        const handleSuccess = async (paymentData: unknown) => {
          setStatus('success')
          setMessage('Thanh toán thành công!')
          const payment = paymentData as { billID?: string; billId?: string }
          let billId = ''
          let billNumber = ''
          const paymentBillId = payment?.billID || payment?.billId
          if (paymentBillId) {
            try {
              const billRes = await BillApi.getById(paymentBillId)
              if (billRes.data?.data) {
                billId = paymentBillId
                billNumber = billRes.data.data.billNumber || ''
              }
            } catch (e) {
              console.error('[PaymentCallback] Failed to fetch bill:', e)
            }
          }
          const paymentInfo = {
            success: true,
            appointmentId,
            billId,
            billNumber,
            paymentMethod: 'PAYOS',
            timestamp: Date.now(),
          }
          localStorage.setItem('paymentSuccess', JSON.stringify(paymentInfo))
          console.log('[PaymentCallback] saved paymentSuccess to localStorage:', paymentInfo)
          setTimeout(() => {
            navigate(`/staff/booking?paymentSuccess=true&appointmentId=${appointmentId}${billId ? `&billId=${billId}` : ''}`)
          }, 300)
        }

        const pollStatus = async (retries = 6) => {
          for (let i = 0; i < retries; i++) {
            try {
              const s = await PaymentApi.getPaymentStatus(paymentLinkId)
              const st = s.data?.data?.status
              console.log('[PaymentCallback] poll status attempt', i + 1, st)
              if (st === 'completed') {
                await handleSuccess(s.data?.data)
                return
              }
            } catch (e) {
              console.warn('[PaymentCallback] poll status error', e)
            }
            await new Promise(r => setTimeout(r, 700))
          }
          setStatus('failed')
          setMessage('Thanh toán chưa được xác nhận')
          setTimeout(() => {
            navigate('/staff/booking?paymentFailed=true')
          }, 800)
        }

        try {
          // Luôn xác nhận trạng thái từ server, không dựa vào status param của PayOS trên URL
          const res = await PaymentApi.confirmPayOSPayment(paymentLinkId)
          if (res.data?.success && res.data.data?.status === 'completed') {
            await handleSuccess(res.data.data)
          } else {
            // Fallback: poll status để chờ backend hoàn tất cập nhật
            await pollStatus()
          }
        } catch (error) {
          console.error('[PaymentCallback] Payment confirmation error:', error)
          // Fallback khi confirm 500/ERR_BAD_RESPONSE: poll status
          await pollStatus()
        }
      } else {
        // Không có paymentLinkId, có thể đã cancel
        setStatus('failed')
        setMessage('Thanh toán đã bị hủy')
        setTimeout(() => {
          navigate('/staff/booking?paymentCanceled=true')
        }, 800)
      }
    }

    confirmPayment()
  }, [appointmentId, paymentLinkId, cancelParam, statusParam, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang xác nhận thanh toán...</h2>
              <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Thanh toán thành công!</h2>
              <p className="text-sm text-gray-600 mb-4">{message}</p>
              <p className="text-xs text-gray-500">Đang chuyển hướng...</p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Thanh toán thất bại</h2>
              <p className="text-sm text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/staff/booking')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Quay lại
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentCallback

