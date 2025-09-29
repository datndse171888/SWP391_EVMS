import React, { useState, useEffect } from 'react'

interface Certificate {
  certificateID: string
  name: string
  description: string
  issuingAuthority: string
}

interface UserFormData {
  email: string
  password: string
  userName: string
  fullName: string
  phoneNumber: string
  photoURL: string
  role: 'staff' | 'technician'
  gender: string
  // Technician specific
  introduction: string
  experience: number
  startDate: string
  certificates: Array<{
    certificateID: string
    issuedDate: string
    expiryDate: string
    status: string
    note: string
    certificateImage: string
  }>
}

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    userName: '',
    fullName: '',
    phoneNumber: '',
    photoURL: '',
    role: 'staff',
    gender: '',
    introduction: '',
    experience: 0,
    startDate: '',
    certificates: []
  })

  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingCertificates, setUploadingCertificates] = useState<{[key: number]: boolean}>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchCertificates()
    }
  }, [isOpen])

  const fetchCertificates = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users/certificates')
      const data = await response.json()
      if (data.success) {
        setCertificates(data.data)
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách certificates:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleAddCertificate = () => {
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, {
        certificateID: '',
        issuedDate: '',
        expiryDate: '',
        status: 'Active',
        note: '',
        certificateImage: ''
      }]
    }))
  }

  const handleRemoveCertificate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }))
  }

  const handleCertificateChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }))
  }

  const uploadToCloudinary = async (file: File, preset: string = 'evms_avatars'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', preset)

    const response = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.secure_url
  }

  const handleCertificateImageUpload = async (index: number, file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        [`certificate_${index}_image`]: 'Chỉ được upload file ảnh'
      }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [`certificate_${index}_image`]: 'Kích thước file không được vượt quá 5MB'
      }))
      return
    }

    setUploadingCertificates(prev => ({ ...prev, [index]: true }))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`certificate_${index}_image`]
      return newErrors
    })

    try {
      const imageUrl = await uploadToCloudinary(file, 'evms_certificates')
      handleCertificateChange(index, 'certificateImage', imageUrl)
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [`certificate_${index}_image`]: 'Lỗi upload ảnh'
      }))
    } finally {
      setUploadingCertificates(prev => ({ ...prev, [index]: false }))
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, photoURL: 'Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)' }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photoURL: 'Kích thước file không được vượt quá 5MB' }))
      return
    }

    setUploading(true)
    setErrors(prev => ({ ...prev, photoURL: '' }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'evms_avatars') // Cloudinary upload preset

      const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, photoURL: data.secure_url }))
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, photoURL: 'Lỗi khi upload ảnh. Vui lòng thử lại.' }))
    } finally {
      setUploading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    // Username validation
    if (!formData.userName) {
      newErrors.userName = 'Tên đăng nhập là bắt buộc'
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
      newErrors.userName = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'
    }

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Tên đầy đủ là bắt buộc'
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Tên đầy đủ phải có ít nhất 2 ký tự'
    }

    // Phone number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Số điện thoại là bắt buộc'
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại phải có 10-11 chữ số'
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Giới tính là bắt buộc'
    }

    // Photo URL validation (if provided)
    if (formData.photoURL && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.photoURL)) {
      newErrors.photoURL = 'URL ảnh không hợp lệ (phải là jpg, jpeg, png, gif, webp)'
    }

    // Technician specific validations
    if (formData.role === 'technician') {
      if (!formData.introduction) {
        newErrors.introduction = 'Giới thiệu là bắt buộc'
      } else if (formData.introduction.length < 10) {
        newErrors.introduction = 'Giới thiệu phải có ít nhất 10 ký tự'
      }

      if (!formData.experience && formData.experience !== 0) {
        newErrors.experience = 'Kinh nghiệm là bắt buộc'
      } else if (formData.experience < 0) {
        newErrors.experience = 'Kinh nghiệm phải >= 0'
      } else if (formData.experience > 50) {
        newErrors.experience = 'Kinh nghiệm không hợp lệ (tối đa 50 năm)'
      }

      if (!formData.startDate) {
        newErrors.startDate = 'Ngày bắt đầu là bắt buộc'
      } else {
        const startDate = new Date(formData.startDate)
        const today = new Date()
        if (startDate > today) {
          newErrors.startDate = 'Ngày bắt đầu không được là tương lai'
        }
        const minDate = new Date()
        minDate.setFullYear(today.getFullYear() - 50)
        if (startDate < minDate) {
          newErrors.startDate = 'Ngày bắt đầu không hợp lệ'
        }
      }

      // Certificate validations
      formData.certificates.forEach((cert, index) => {
        if (cert.certificateID) {
          if (!cert.issuedDate) {
            newErrors[`certificate_${index}_issuedDate`] = 'Ngày cấp là bắt buộc'
          } else {
            const issuedDate = new Date(cert.issuedDate)
            const today = new Date()
            if (issuedDate > today) {
              newErrors[`certificate_${index}_issuedDate`] = 'Ngày cấp không được là tương lai'
            }
          }

          if (!cert.expiryDate) {
            newErrors[`certificate_${index}_expiryDate`] = 'Ngày hết hạn là bắt buộc'
          } else if (cert.issuedDate && new Date(cert.expiryDate) <= new Date(cert.issuedDate)) {
            newErrors[`certificate_${index}_expiryDate`] = 'Ngày hết hạn phải sau ngày cấp'
          }

          if (!cert.status) {
            newErrors[`certificate_${index}_status`] = 'Trạng thái là bắt buộc'
          }

          if (!cert.certificateImage) {
            newErrors[`certificate_${index}_image`] = 'Ảnh chứng chỉ là bắt buộc'
          }
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        userName: formData.userName,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        photoURL: formData.photoURL,
        role: formData.role,
        gender: formData.gender,
        ...(formData.role === 'technician' && {
          introduction: formData.introduction,
          experience: formData.experience,
          startDate: formData.startDate,
          certificates: formData.certificates.filter(cert => cert.certificateID)
        })
      }

      const response = await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          email: '',
          password: '',
          userName: '',
          fullName: '',
          phoneNumber: '',
          photoURL: '',
          role: 'staff',
          gender: '',
          introduction: '',
          experience: 0,
          startDate: '',
          certificates: []
        })
      } else {
        setErrors({ submit: data.message || 'Có lỗi xảy ra' })
      }
    } catch (error) {
      setErrors({ submit: 'Có lỗi xảy ra khi tạo người dùng' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Thêm người dùng mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vai trò *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="staff"
                  checked={formData.role === 'staff'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Staff</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="technician"
                  checked={formData.role === 'technician'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Technician</span>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="user@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Mật khẩu"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập *</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.userName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="username"
              />
              {errors.userName && <p className="text-red-500 text-sm mt-1">{errors.userName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đầy đủ *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="0123456789"
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.gender ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh đại diện</label>
              
              {/* Image Preview */}
              {formData.photoURL && (
                <div className="mb-4">
                  <img 
                    src={formData.photoURL} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={uploading}
                />
                
                {uploading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Đang upload...</span>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Hoặc nhập URL ảnh: jpg, jpeg, png, gif, webp (tối đa 5MB)
                </p>
              </div>

              {/* URL Input */}
              <input
                type="url"
                name="photoURL"
                value={formData.photoURL}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 ${
                  errors.photoURL ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.photoURL && <p className="text-red-500 text-sm mt-1">{errors.photoURL}</p>}
            </div>
          </div>

          {/* Technician Specific Fields */}
          {formData.role === 'technician' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin Technician</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giới thiệu *</label>
                  <textarea
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.introduction ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Giới thiệu về bản thân..."
                  />
                  {errors.introduction && <p className="text-red-500 text-sm mt-1">{errors.introduction}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kinh nghiệm (năm) *</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.experience ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="0"
                  />
                  {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày bắt đầu *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>
              </div>

              {/* Certificates */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-800">Chứng chỉ</h4>
                  <button
                    type="button"
                    onClick={handleAddCertificate}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    Thêm chứng chỉ
                  </button>
                </div>

                {formData.certificates.map((cert, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-700">Chứng chỉ {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => handleRemoveCertificate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại chứng chỉ</label>
                        <select
                          value={cert.certificateID}
                          onChange={(e) => handleCertificateChange(index, 'certificateID', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Chọn chứng chỉ</option>
                          {certificates.map((certType) => (
                            <option key={certType.certificateID} value={certType.certificateID}>
                              {certType.name} - {certType.issuingAuthority}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                        <select
                          value={cert.status}
                          onChange={(e) => handleCertificateChange(index, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Expired">Expired</option>
                          <option value="Pending">Pending</option>
                          <option value="Revoked">Revoked</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày cấp</label>
                        <input
                          type="date"
                          value={cert.issuedDate}
                          onChange={(e) => handleCertificateChange(index, 'issuedDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`certificate_${index}_issuedDate`] ? 'border-red-500' : 'border-gray-200'
                          }`}
                        />
                        {errors[`certificate_${index}_issuedDate`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`certificate_${index}_issuedDate`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn</label>
                        <input
                          type="date"
                          value={cert.expiryDate}
                          onChange={(e) => handleCertificateChange(index, 'expiryDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`certificate_${index}_expiryDate`] ? 'border-red-500' : 'border-gray-200'
                          }`}
                        />
                        {errors[`certificate_${index}_expiryDate`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`certificate_${index}_expiryDate`]}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                        <input
                          type="text"
                          value={cert.note}
                          onChange={(e) => handleCertificateChange(index, 'note', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ghi chú thêm..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh chứng chỉ</label>
                        <div className="space-y-3">
                          {cert.certificateImage ? (
                            <div className="relative">
                              <img
                                src={cert.certificateImage}
                                alt="Certificate preview"
                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => handleCertificateChange(index, 'certificateImage', '')}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleCertificateImageUpload(index, file)
                                  }
                                }}
                                className="hidden"
                                id={`certificate-image-${index}`}
                                disabled={uploadingCertificates[index]}
                              />
                              <label
                                htmlFor={`certificate-image-${index}`}
                                className="cursor-pointer flex flex-col items-center"
                              >
                                {uploadingCertificates[index] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                                    <p className="text-sm text-gray-600">Đang upload...</p>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-sm text-gray-600">
                                      <span className="text-blue-500 font-medium">Click để upload</span> hoặc kéo thả ảnh chứng chỉ
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (tối đa 5MB)</p>
                                  </>
                                )}
                              </label>
                            </div>
                          )}
                          {errors[`certificate_${index}_image`] && (
                            <p className="text-red-500 text-xs">{errors[`certificate_${index}_image`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo người dùng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddUserModal
