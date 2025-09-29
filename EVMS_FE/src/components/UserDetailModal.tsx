import React, { useState, useEffect } from 'react'

interface User {
  _id: string
  userName: string
  email: string
  fullName?: string
  phoneNumber?: string
  photoURL?: string
  role?: string
  gender?: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

interface TechnicianInfo {
  id: string
  introduction: string
  experience: number
  startDate: string
}


interface TechnicianCertificate {
  certificateID: string
  issuedDate: string
  expiryDate: string
  status: string
  note: string
  certificateImage: string
}

interface UserDetailModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
  const [technicianInfo, setTechnicianInfo] = useState<TechnicianInfo | null>(null)
  const [certificates, setCertificates] = useState<TechnicianCertificate[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user && user.role === 'technician') {
      fetchTechnicianDetails()
    }
  }, [isOpen, user])

  const fetchTechnicianDetails = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch technician info
      const techResponse = await fetch(`http://localhost:4000/api/users/${user._id}/technician`)
      if (techResponse.ok) {
        const techData = await techResponse.json()
        if (techData.success) {
          setTechnicianInfo(techData.data.technician)
        }
      }

      // Fetch technician certificates
      const certResponse = await fetch(`http://localhost:4000/api/users/${user._id}/certificates`)
      if (certResponse.ok) {
        const certData = await certResponse.json()
        if (certData.success) {
          setCertificates(certData.data.certificates)
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin technician:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (isDisabled: boolean) => {
    if (isDisabled) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
          Vô hiệu hóa
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-600">
        Hoạt động
      </span>
    )
  }

  const getRoleBadge = (role?: string) => {
    if (role === 'admin') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md">
          Admin
        </span>
      )
    } else if (role === 'technician') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md">
          Technician
        </span>
      )
    } else if (role === 'staff') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md">
          Staff
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
        User
      </span>
    )
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">
                {user.fullName ? user.fullName.charAt(0) : user.userName.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{user.fullName || user.userName}</h3>
              <p className="text-gray-600 mb-2">@{user.userName}</p>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="flex items-center gap-4">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.isDisabled)}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Tên đầy đủ:</span>
                  <p className="text-gray-800">{user.fullName || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Số điện thoại:</span>
                  <p className="text-gray-800">{user.phoneNumber || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Giới tính:</span>
                  <p className="text-gray-800 capitalize">{user.gender || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Ngày tạo:</span>
                  <p className="text-gray-800">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Cập nhật lần cuối:</span>
                  <p className="text-gray-800">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Thông tin tài khoản</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Tên đăng nhập:</span>
                  <p className="text-gray-800">{user.userName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Vai trò:</span>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                  <div className="mt-1">{getStatusBadge(user.isDisabled)}</div>
                </div>
                {user.photoURL && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Ảnh đại diện:</span>
                    <div className="mt-2">
                      <img 
                        src={user.photoURL} 
                        alt="Avatar" 
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technician Information */}
          {user.role === 'technician' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Thông tin Technician</h4>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Đang tải thông tin...</p>
                </div>
              ) : technicianInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Giới thiệu:</span>
                    <p className="text-gray-800 mt-1">{technicianInfo.introduction}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Kinh nghiệm:</span>
                    <p className="text-gray-800 mt-1">{technicianInfo.experience} năm</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Ngày bắt đầu:</span>
                    <p className="text-gray-800 mt-1">{formatDate(technicianInfo.startDate)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Không có thông tin technician</p>
              )}
            </div>
          )}

          {/* Certificates */}
          {user.role === 'technician' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Chứng chỉ</h4>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Đang tải chứng chỉ...</p>
                </div>
              ) : certificates.length > 0 ? (
                <div className="space-y-4">
                  {certificates.map((cert, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-800">Chứng chỉ {index + 1}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cert.status === 'Active' ? 'bg-green-100 text-green-600' :
                          cert.status === 'Expired' ? 'bg-red-100 text-red-600' :
                          cert.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {cert.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Ngày cấp:</span>
                          <p className="text-gray-800">{formatDate(cert.issuedDate)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Ngày hết hạn:</span>
                          <p className="text-gray-800">{formatDate(cert.expiryDate)}</p>
                        </div>
                        {cert.note && (
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Ghi chú:</span>
                            <p className="text-gray-800">{cert.note}</p>
                          </div>
                        )}
                        {cert.certificateImage && (
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Ảnh chứng chỉ:</span>
                            <div className="mt-2">
                              <img
                                src={cert.certificateImage}
                                alt="Certificate"
                                className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Không có chứng chỉ nào</p>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-6 border-t mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal
