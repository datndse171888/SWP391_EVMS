import React, { useState, useEffect } from 'react'
import { api } from '../utils/Axios'

interface Certificate {
  _id: string
  name: string
  description: string
  issuingAuthority: string
}

interface CertificateFormData {
  certificateID: string
  issuedDate: string
  expiryDate: string
  status: 'Active' | 'Expired' | 'Pending' | 'Revoked'
  note: string
  certificateImage: string
}

interface AddCertificateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  technicianId: string
  technicianName: string
}

export const AddCertificateModal: React.FC<AddCertificateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  technicianId,
  technicianName
}) => {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<CertificateFormData>({
    certificateID: '',
    issuedDate: '',
    expiryDate: '',
    status: 'Active',
    note: '',
    certificateImage: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchCertificates()
      // Reset form
      setFormData({
        certificateID: '',
        issuedDate: '',
        expiryDate: '',
        status: 'Active',
        note: '',
        certificateImage: ''
      })
      setErrors({})
    }
  }, [isOpen])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/certificates')
      if (response.data?.success) {
        setCertificates(response.data.data || [])
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chứng chỉ:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.certificateID) {
      newErrors.certificateID = 'Chứng chỉ là bắt buộc'
    }

    if (!formData.issuedDate) {
      newErrors.issuedDate = 'Ngày cấp là bắt buộc'
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Ngày hết hạn là bắt buộc'
    } else if (formData.issuedDate && new Date(formData.expiryDate) <= new Date(formData.issuedDate)) {
      newErrors.expiryDate = 'Ngày hết hạn phải sau ngày cấp'
    }

    if (!formData.status) {
      newErrors.status = 'Trạng thái là bắt buộc'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      // First, get technician ID from user ID
      const techInfoResponse = await api.get(`/technicians/${technicianId}/info`)
      if (!techInfoResponse.data?.success) {
        throw new Error('Không tìm thấy thông tin kỹ thuật viên')
      }

      const technicianInfo = techInfoResponse.data.data.technician
      const technicianDbId = technicianInfo.id

      // Create certificate
      const response = await api.post(`/users/${technicianId}/certificates`, {
        certificates: [{
          certificateID: formData.certificateID,
          issuedDate: formData.issuedDate,
          expiryDate: formData.expiryDate,
          status: formData.status,
          note: formData.note || '',
          certificateImage: formData.certificateImage || ''
        }]
      })

      if (response.data?.success) {
        onSuccess()
        onClose()
      } else {
        throw new Error(response.data?.message || 'Lỗi khi thêm chứng chỉ')
      }
    } catch (error: any) {
      console.error('Lỗi khi thêm chứng chỉ:', error)
      setErrors({ submit: error?.response?.data?.message || 'Lỗi khi thêm chứng chỉ. Vui lòng thử lại.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Thêm chứng chỉ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Kỹ thuật viên:</span> {technicianName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chứng chỉ <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Đang tải danh sách chứng chỉ...</div>
            ) : (
              <select
                name="certificateID"
                value={formData.certificateID}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0 ${
                  errors.certificateID ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn chứng chỉ --</option>
                {certificates.map((cert) => (
                  <option key={cert._id} value={cert._id}>
                    {cert.name} - {cert.issuingAuthority}
                  </option>
                ))}
              </select>
            )}
            {errors.certificateID && (
              <p className="mt-1 text-sm text-red-500">{errors.certificateID}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày cấp <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="issuedDate"
                value={formData.issuedDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0 ${
                  errors.issuedDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.issuedDate && (
                <p className="mt-1 text-sm text-red-500">{errors.issuedDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày hết hạn <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0 ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
              <option value="Revoked">Revoked</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0"
              placeholder="Nhập ghi chú (tùy chọn)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL ảnh chứng chỉ
            </label>
            <input
              type="url"
              name="certificateImage"
              value={formData.certificateImage}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0"
              placeholder="https://example.com/certificate.jpg"
            />
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-0 text-white rounded-lg hover:bg-azure-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang thêm...' : 'Thêm chứng chỉ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

