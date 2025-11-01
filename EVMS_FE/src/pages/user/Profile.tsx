import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../api/AuthApi";
import { AppointmentApi } from "../../api/AppointmentApi";
import { compressImage, uploadImageApi } from "../../api/UploadApi";
import type { Appointment } from "../../types/Account";
import type { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import whaleLogo from "../../assets/images/whale.png";

type Tab = "profile" | "appointments";

const menuTabs = [
  { key: "profile", label: "Hồ sơ người dùng" },
  { key: "appointments", label: "Lịch hẹn" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    fullName: authUser?.fullName || "",
    phoneNumber: authUser?.phoneNumber || "",
    gender: authUser?.gender || "",
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<{
    fullName?: string;
    phoneNumber?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password modal states
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await AppointmentApi.getAppointmentByMe();
      let appointmentsData: Appointment[] = [];
      
      const data = response.data as unknown;
      
      if (Array.isArray(data)) {
        appointmentsData = data;
      } else if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>;
        if (Array.isArray(dataObj.data)) {
          appointmentsData = dataObj.data;
        } else if (Array.isArray(dataObj.appointment)) {
          appointmentsData = dataObj.appointment;
        } else if (Array.isArray(dataObj.appointments)) {
          appointmentsData = dataObj.appointments;
        }
      }
      
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser?.id) return;

    try {
      setIsUploadingAvatar(true);
      const compressedFile = await compressImage(file, 600, 600, 0.6, 300);
      const imageUrl = await uploadImageApi(compressedFile);
      
      await authApi.updateProfile({ photoURL: imageUrl });
      updateUser({ photoURL: imageUrl });
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleUpdate = async () => {
    if (!authUser?.id) return;
    
    if (!editData.fullName?.trim()) {
      setFieldError({ fullName: "Họ và tên không được để trống" });
      return;
    }

    setLoading(true);
    try {
      await authApi.updateProfile({
        fullName: editData.fullName,
        phoneNumber: editData.phoneNumber,
        gender: editData.gender,
      });
      
      const response = await authApi.getProfile();
      const updatedUser = response.data?.data?.user || response.data?.user || response.data;
      if (updatedUser) {
        updateUser(updatedUser);
      }
      
      setEditMode(false);
      setFieldError({});
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const errorMsg = axiosErr?.response?.data?.message || "Cập nhật thất bại!";
      
      if (errorMsg.toLowerCase().includes("số điện thoại")) {
        setFieldError((prev) => ({ ...prev, phoneNumber: errorMsg }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData({
      fullName: authUser?.fullName || "",
      phoneNumber: authUser?.phoneNumber || "",
      gender: authUser?.gender || "",
    });
    setFieldError({});
  };

  const handleChangePassword = async () => {
    setPwdError("");
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("Mật khẩu mới không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      setPwdError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setPwdLoading(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      
      setShowPwdModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setPwdError(
        axiosErr?.response?.data?.message || "Đổi mật khẩu thất bại!"
      );
    } finally {
      setPwdLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return { backgroundColor: 'rgba(9, 145, 243, 0.1)', borderColor: '#0991f3', color: '#014091' };
      case "completed":
        return { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: '#22c55e', color: '#15803d' };
      case "cancelled":
        return { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#dc2626' };
      default:
        return { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Đã đặt lịch";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (!authUser) {
    return (
      <div className="min-h-screen bg-[#DBE8FA] flex items-center justify-center">
        <div className="text-gray-500">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBE8FA] flex flex-col items-center py-4 px-2 relative overflow-x-hidden">
      {/* Bóng tròn 2 màu chủ đạo */}
      <div className="absolute top-10 left-[-80px] w-60 h-60 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-1/3 left-[-100px] w-72 h-72 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute bottom-20 left-[-60px] w-44 h-44 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-20 right-[-80px] w-60 h-60 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute top-1/2 right-[-100px] w-72 h-72 bg-[#e3f2fd] rounded-full opacity-20 blur-2xl z-0"></div>
      <div className="absolute bottom-10 right-[-60px] w-44 h-44 bg-[#b3e5fc] rounded-full opacity-20 blur-2xl z-0"></div>

      <div className="bg-white rounded-3xl shadow-sm flex flex-col w-full max-w-7xl overflow-visible relative min-h-[calc(100vh-2rem)]">
        {/* Main content container */}
        <div className="flex flex-row w-full">
          {/* Sidebar */}
          <div className="w-64 py-10 px-6 bg-[#f7fafd] min-h-full">
            {/* Nút quay về trang chủ nằm trong menu */}
            <Link
              to="/"
              className="inline-flex items-center font-medium hover:underline bg-white rounded-lg px-3 py-1.5 shadow-sm mb-4 transition-colors"
              style={{ color: '#014091', border: '1px solid #e3f2fd' }}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Trang chủ
            </Link>
            <nav className="flex flex-col gap-2">
              {menuTabs.map((m) => (
                <button
                  key={m.key}
                  className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    tab === m.key
                      ? "bg-white shadow-sm"
                      : "text-gray-600 hover:bg-opacity-10"
                  }`}
                  style={tab === m.key ? { color: '#014091' } : { color: '#5f6777' }}
                  onMouseEnter={(e) => {
                    if (tab !== m.key) {
                      e.currentTarget.style.backgroundColor = 'rgba(9, 145, 243, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tab !== m.key) {
                      e.currentTarget.style.backgroundColor = '';
                    }
                  }}
                  onClick={() => setTab(m.key as Tab)}
                >
                  {m.label}
                </button>
              ))}
            </nav>
          </div>
          {/* Main content */}
          <div className="flex-1">
            <div className="w-full px-8 py-8">
              {tab === "profile" && (
                <div className="bg-white rounded-lg shadow-lg p-8 w-full">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Phần Avatar */}
                    <div className="flex flex-col items-center space-y-4 w-full md:w-1/3">
                      <div className="relative w-48 h-48">
                        <img
                          src={authUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.fullName || authUser?.userName || 'User')}&background=014091&color=fff`}
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-full border-4"
                          style={{ borderColor: '#014091' }}
                        />
                        <button
                          onClick={handleAvatarClick}
                          className="absolute bottom-2 right-2 text-white p-2 rounded-full transition-colors hover:opacity-90"
                          style={{ backgroundColor: '#014091' }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarChange}
                          className="hidden"
                          accept="image/*"
                        />
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <div className="text-white text-sm">Đang tải...</div>
                          </div>
                        )}
                      </div>
                      <h2 
                        className="text-2xl font-bold text-center"
                        style={{ color: '#014091' }}
                      >
                        {authUser?.fullName || authUser?.userName}
                      </h2>
                      <p className="text-gray-600 text-center">
                        {authUser?.role === "customer"
                          ? "Khách hàng"
                          : authUser?.role === "admin"
                          ? "Quản trị viên"
                          : authUser?.role === "staff"
                          ? "Nhân viên"
                          : authUser?.role === "technician"
                          ? "Kỹ thuật viên"
                          : ""}
                      </p>
                    </div>

                    {/* Phần thông tin */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-6">
                        <h3 
                          className="text-xl font-semibold"
                          style={{ color: '#014091' }}
                        >
                          Thông tin cá nhân
                        </h3>
                        <div className="flex items-center gap-4">
                          {!editMode ? (
                            <button
                              onClick={() => setEditMode(true)}
                              className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 hover:opacity-90"
                              style={{ backgroundColor: '#f6ae2d', color: '#014091' }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Chỉnh sửa
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 hover:opacity-90"
                                style={{ backgroundColor: '#014091' }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Form fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Họ và tên
                          </label>
                          <input
                            type="text"
                            value={editData.fullName || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                fullName: e.target.value,
                              })
                            }
                            disabled={!editMode}
                            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                              editMode
                                ? "focus:ring-2"
                                : "bg-gray-50 border-gray-200"
                            }`}
                            style={editMode ? { 
                              borderColor: '#0991f3'
                            } as React.CSSProperties : {}}
                            onFocus={(e) => {
                              if (editMode) {
                                e.currentTarget.style.borderColor = '#014091';
                                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(9, 145, 243, 0.2)';
                              }
                            }}
                            onBlur={(e) => {
                              if (editMode) {
                                e.currentTarget.style.borderColor = '#0991f3';
                                e.currentTarget.style.boxShadow = '';
                              }
                            }}
                            placeholder="Nhập họ và tên"
                          />
                          {fieldError.fullName && (
                            <p className="text-red-500 text-sm mt-1">
                              {fieldError.fullName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            value={authUser?.email || ""}
                            disabled
                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            value={editData.phoneNumber || ""}
                            onChange={(e) => {
                              setEditData({
                                ...editData,
                                phoneNumber: e.target.value,
                              });
                              if (fieldError.phoneNumber) {
                                setFieldError((prev) => ({
                                  ...prev,
                                  phoneNumber: undefined,
                                }));
                              }
                            }}
                            disabled={!editMode}
                            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                              fieldError.phoneNumber
                                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                                : editMode
                                ? "focus:ring-2"
                                : "bg-gray-50 border-gray-200"
                            }`}
                            style={!fieldError.phoneNumber && editMode ? { 
                              borderColor: '#0991f3'
                            } as React.CSSProperties : {}}
                            onFocus={(e) => {
                              if (editMode && !fieldError.phoneNumber) {
                                e.currentTarget.style.borderColor = '#014091';
                                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(9, 145, 243, 0.2)';
                              }
                            }}
                            onBlur={(e) => {
                              if (editMode && !fieldError.phoneNumber) {
                                e.currentTarget.style.borderColor = '#0991f3';
                                e.currentTarget.style.boxShadow = '';
                              }
                            }}
                            placeholder="0xxxxxxxxx"
                          />
                          {fieldError.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1">
                              {fieldError.phoneNumber}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Giới tính
                          </label>
                          <select
                            value={editData.gender || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                gender: e.target.value,
                              })
                            }
                            disabled={!editMode}
                            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                              editMode
                                ? "focus:ring-2"
                                : "bg-gray-50 border-gray-200"
                            }`}
                            style={editMode ? { 
                              borderColor: '#0991f3'
                            } as React.CSSProperties : {}}
                            onFocus={(e) => {
                              if (editMode) {
                                e.currentTarget.style.borderColor = '#014091';
                                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(9, 145, 243, 0.2)';
                              }
                            }}
                            onBlur={(e) => {
                              if (editMode) {
                                e.currentTarget.style.borderColor = '#0991f3';
                                e.currentTarget.style.boxShadow = '';
                              }
                            }}
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                          </select>
                        </div>
                      </div>

                      {/* Nút đổi mật khẩu */}
                      <div className="col-span-2">
                        <button
                          onClick={() => setShowPwdModal(true)}
                          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Đổi mật khẩu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {tab === "appointments" && (
                <div className="p-7 w-full">
                  <div 
                    className="font-semibold mb-4 text-lg"
                    style={{ color: '#014091' }}
                  >
                    Lịch hẹn của bạn
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div 
                        className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: '#014091' }}
                      ></div>
                      <p className="text-gray-500 mt-4">Đang tải...</p>
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-500 text-lg mb-4">Bạn chưa có lịch hẹn nào</p>
                      <button
                        onClick={() => navigate("/booking")}
                        className="px-6 py-3 text-white rounded-lg transition-colors font-medium hover:opacity-90"
                        style={{ backgroundColor: '#f6ae2d', color: '#014091' }}
                      >
                        Đặt lịch ngay
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="bg-white hover:bg-opacity-95 transition-all duration-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm cursor-pointer border"
                          style={{ 
                            borderColor: '#e3f2fd',
                            backgroundColor: 'rgba(219, 232, 250, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(9, 145, 243, 0.1)';
                            e.currentTarget.style.borderColor = '#0991f3';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(219, 232, 250, 0.3)';
                            e.currentTarget.style.borderColor = '#e3f2fd';
                          }}
                        >
                          <div>
                            <div className="font-medium text-base text-gray-800 flex items-center gap-2 mb-1">
                              {appointment.title}
                              <span
                                className="px-2 py-0.5 text-xs font-medium rounded-full border"
                                style={getStatusColor(appointment.status)}
                              >
                                {getStatusLabel(appointment.status)}
                              </span>
                            </div>
                            {appointment.description && (
                              <div className="text-sm text-gray-600 mb-2">
                                {appointment.description}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                style={{ color: '#0991f3' }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {formatDate(appointment.appointment_date)}
                            </div>
                            {appointment.location && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <svg
                                  className="w-3 h-3 text-sky-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {appointment.location}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="w-full h-40 mt-auto relative -mb-0">
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              className="w-full"
            >
              <path
                fill="#DBE8FA"
                fillOpacity="1"
                d="M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,128C672,139,768,181,864,176C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
            <img
              src={whaleLogo}
              alt="Whale decoration"
              className="absolute right-16 bottom-4 w-32 h-auto opacity-80"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Đổi mật khẩu</h3>
              <button
                onClick={() => {
                  setShowPwdModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPwdError("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                    style={{ '--tw-ring-color': '#0991f3' } as React.CSSProperties}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#014091';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(9, 145, 243, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showCurrentPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                    style={{ '--tw-ring-color': '#0991f3' } as React.CSSProperties}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#014091';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(9, 145, 243, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showNewPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (newPassword !== e.target.value && e.target.value) {
                        setPwdError("Mật khẩu không khớp");
                      } else {
                        setPwdError("");
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                    style={{ '--tw-ring-color': '#0991f3' } as React.CSSProperties}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#014091';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(9, 145, 243, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPwd ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
              {pwdError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-500 text-sm">{pwdError}</p>
                </div>
              )}
              <button
                onClick={handleChangePassword}
                disabled={pwdLoading || !!pwdError}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  pwdLoading || !!pwdError
                    ? "bg-gray-300 cursor-not-allowed"
                    : "text-white hover:opacity-90"
                }`}
                style={pwdLoading || !!pwdError ? {} : { backgroundColor: '#014091' }}
              >
                {pwdLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
