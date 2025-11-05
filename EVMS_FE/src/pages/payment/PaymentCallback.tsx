import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { PaymentApi } from '../../api/PaymentApi'

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('')

  const appointmentId = searchParams.get('appointmentId')
  const paymentLinkId = searchParams.get('paymentLinkId') || searchParams.get('code')

  useEffect(() => {
    const confirmPayment = async () => {
      if (!appointmentId) {
        setStatus('failed')
        setMessage('Thiếu thông tin appointment')
        return
      }

      if (paymentLinkId) {
        try {
          // Xác nhận payment từ PayOS
          const res = await PaymentApi.confirmPayOSPayment(paymentLinkId)

          if (res.data?.success && res.data.data?.status === 'completed') {
            setStatus('success')
            setMessage('Thanh toán thành công!')
            
            // Redirect về booking page sau 2 giây
            setTimeout(() => {
              navigate('/staff/booking')
            }, 2000)
          } else {
            setStatus('failed')
            setMessage(res.data?.message || 'Thanh toán chưa được xác nhận')
          }
        } catch (error) {
          console.error('Payment confirmation error:', error)
          const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán'
          setStatus('failed')
          setMessage(errorMessage)
        }
      } else {
        // Không có paymentLinkId, có thể đã cancel
        setStatus('failed')
        setMessage('Thanh toán đã bị hủy')
      }
    }

    confirmPayment()
  }, [appointmentId, paymentLinkId, navigate])

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

