import React, { useState, useEffect } from 'react'
import { api } from '../utils/Axios'
import { compressImage, uploadImageApi } from '../api/UploadApi'

interface CertificateFormData {
  // Certificate info
  name: string
  description: string
  issuingAuthority: string
  validityPeriod: string
  // TechnicianCertificate info
  issuedDate: string
  expiryDate: string
  status: 'Active' | 'Expired' | 'Pending' | 'Revoked'
  note: string
  certificateImage: string
  certificateImageFile: File | null
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
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<CertificateFormData>({
    name: '',
    description: '',
    issuingAuthority: '',
    validityPeriod: '',
    issuedDate: '',
    expiryDate: '',
    status: 'Active',
    note: '',
    certificateImage: '',
    certificateImageFile: null
  })

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setFormData({
        name: '',
        description: '',
        issuingAuthority: '',
        validityPeriod: '',
        issuedDate: '',
        expiryDate: '',
        status: 'Active',
        note: '',
        certificateImage: '',
        certificateImageFile: null
      })
      setErrors({})
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, certificateImage: 'Chỉ được upload file ảnh' }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, certificateImage: 'Kích thước file không được vượt quá 5MB' }))
      return
    }

    setErrors(prev => ({ ...prev, certificateImage: '' }))
    setFormData(prev => ({ ...prev, certificateImageFile: file }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) {
      newErrors.name = 'Tên chứng chỉ là bắt buộc'
    }

    if (!formData.description) {
      newErrors.description = 'Mô tả là bắt buộc'
    }

    if (!formData.issuingAuthority) {
      newErrors.issuingAuthority = 'Cơ quan cấp là bắt buộc'
    }

    if (!formData.validityPeriod) {
      newErrors.validityPeriod = 'Thời hạn hiệu lực là bắt buộc'
    } else if (Number(formData.validityPeriod) < 1) {
      newErrors.validityPeriod = 'Thời hạn hiệu lực phải lớn hơn 0'
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
    setUploading(false)
    try {
      let certificateImageUrl = formData.certificateImage

      // Upload image if file is selected
      if (formData.certificateImageFile) {
        setUploading(true)
        try {
          // Compress image before upload
          const compressedFile = await compressImage(
            formData.certificateImageFile,
            1920, // maxWidth
            1920, // maxHeight
            0.7, // quality
            500 // maxFileSizeKB
          )
          
          // Upload to Cloudinary
          certificateImageUrl = await uploadImageApi(compressedFile)
          console.log('✅ Image uploaded successfully:', certificateImageUrl)
        } catch (uploadError: any) {
          console.error('Lỗi khi upload ảnh:', uploadError)
          setErrors({ submit: uploadError?.message || 'Lỗi khi upload ảnh. Vui lòng thử lại.' })
          setUploading(false)
          setSubmitting(false)
          return
        } finally {
          setUploading(false)
        }
      }

      // Create certificate and technician certificate
      const response = await api.post(`/users/${technicianId}/certificates`, {
        // Certificate info
        name: formData.name,
        description: formData.description,
        issuingAuthority: formData.issuingAuthority,
        validityPeriod: Number(formData.validityPeriod),
        // TechnicianCertificate info
        issuedDate: formData.issuedDate,
        expiryDate: formData.expiryDate,
        status: formData.status,
        note: formData.note || '',
        certificateImage: certificateImageUrl || ''
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
      setUploading(false)
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
              Tên chứng chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tên chứng chỉ"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập mô tả chứng chỉ"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cơ quan cấp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="issuingAuthority"
                value={formData.issuingAuthority}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0 ${
                  errors.issuingAuthority ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập cơ quan cấp"
              />
              {errors.issuingAuthority && (
                <p className="mt-1 text-sm text-red-500">{errors.issuingAuthority}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thời hạn hiệu lực (tháng) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="validityPeriod"
                value={formData.validityPeriod}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0 ${
                  errors.validityPeriod ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập số tháng"
              />
              {errors.validityPeriod && (
                <p className="mt-1 text-sm text-red-500">{errors.validityPeriod}</p>
              )}
            </div>
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
              Ảnh chứng chỉ
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-0 ${
                errors.certificateImage ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.certificateImage && (
              <p className="mt-1 text-sm text-red-500">{errors.certificateImage}</p>
            )}
            {formData.certificateImageFile && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Đã chọn: {formData.certificateImageFile.name}</p>
                <div className="mt-2 max-w-xs">
                  <img
                    src={URL.createObjectURL(formData.certificateImageFile)}
                    alt="Preview"
                    className="w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            )}
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
              disabled={submitting || uploading}
              className="px-6 py-2 bg-blue-0 text-white rounded-lg hover:bg-azure-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Đang upload ảnh...' : submitting ? 'Đang thêm...' : 'Thêm chứng chỉ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

