// src/pages/user/Profile.tsx - Updated with new layout
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../api/AuthApi";
import { compressImage } from "../../api/UploadApi";
import type { AxiosError } from "axios";
import { Eye, EyeOff, CheckCircle, XCircle, Info, X } from "lucide-react";
import { UserProfileLayout } from "../../components/layout/UserProfileLayout";
import { UserProfileSidebar } from "../../components/layout/UserProfileSidebar";
import { UserProfileHeader } from "../../components/layout/UserProfileHeader";

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    fullName: authUser?.fullName || "",
    phoneNumber: authUser?.phoneNumber || "",
    gender: authUser?.gender || "",
  });
  const [saving, setSaving] = useState(false);
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

  // Toast notification state
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Show toast notification
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser?.id) return;

    const startTime = performance.now();
    setIsUploadingAvatar(true);

    try {
      console.log(`📸 Starting compression... Original: ${(file.size / 1024).toFixed(2)}KB`);
      const compressionStart = performance.now();
      const compressedFile = await compressImage(file, 400, 400, 0.5, 150);
      const compressionTime = ((performance.now() - compressionStart) / 1000).toFixed(2);
      const compressedSizeKB = (compressedFile.size / 1024).toFixed(2);
      console.log(`✅ Compression done in ${compressionTime}s: ${compressedSizeKB}KB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reduction)`);

      console.log(`📤 Starting upload to Cloudinary...`);
      const uploadStart = performance.now();
      const formData = new FormData();
      formData.append('image', compressedFile);

      const baseUrl = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('accessToken');

      const uploadResponse = await fetch(`${baseUrl}/uploads/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      const uploadTime = ((performance.now() - uploadStart) / 1000).toFixed(2);
      console.log(`✅ Upload done in ${uploadTime}s`);

      if (!uploadData.imageUrl) {
        throw new Error('No imageUrl in response');
      }

      console.log(`💾 Updating profile...`);
      const updateStart = performance.now();
      await authApi.updateProfile({ photoURL: uploadData.imageUrl });
      const updateTime = ((performance.now() - updateStart) / 1000).toFixed(2);
      console.log(`✅ Profile updated in ${updateTime}s`);

      updateUser({ photoURL: uploadData.imageUrl });

      const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`🎉 Total time: ${totalTime}s (Compress: ${compressionTime}s, Upload: ${uploadTime}s, Update: ${updateTime}s)`);

      showToast('success', 'Cập nhật ảnh đại diện thành công!');
    } catch (error: unknown) {
      console.error("❌ Error uploading avatar:", error);
      const errorMsg = error instanceof Error ? error.message : "Không thể tải ảnh lên. Vui lòng thử lại!";
      showToast('error', errorMsg);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdate = async () => {
    if (!authUser?.id) return;

    if (!editData.fullName?.trim()) {
      setFieldError({ fullName: "Họ và tên không được để trống" });
      return;
    }

    setSaving(true);
    try {
      const response = await authApi.updateProfile({
        fullName: editData.fullName,
        phoneNumber: editData.phoneNumber,
        gender: editData.gender,
      });

      const updatedUser = response.data.data?.user;

      if (updatedUser) {
        updateUser(updatedUser);
        setEditMode(false);
        setFieldError({});
        showToast('success', 'Cập nhật thông tin thành công!');
      } else {
        const profileResponse = await authApi.getProfile();
        const userFromProfile = profileResponse.data?.data?.user || profileResponse.data?.user || profileResponse.data;
        if (userFromProfile) {
          updateUser(userFromProfile);
        }
        setEditMode(false);
        setFieldError({});
        showToast('success', 'Cập nhật thông tin thành công!');
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const errorMsg = axiosErr?.response?.data?.message || "Cập nhật thất bại!";

      showToast('error', errorMsg);

      if (errorMsg.toLowerCase().includes("số điện thoại")) {
        setFieldError((prev) => ({ ...prev, phoneNumber: errorMsg }));
      } else {
        setFieldError((prev) => ({ ...prev, fullName: errorMsg }));
      }
    } finally {
      setSaving(false);
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
      setPwdError("");
      showToast('success', 'Đổi mật khẩu thành công!');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setPwdError(
        axiosErr?.response?.data?.message || "Đổi mật khẩu thất bại!"
      );
    } finally {
      setPwdLoading(false);
    }
  };

  if (!authUser) {
    return (
      <UserProfileLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Đang tải thông tin...</div>
        </div>
      </UserProfileLayout>
    );
  }

  return (
    <UserProfileLayout>
      <div className="flex flex-row w-full">
        <UserProfileSidebar />

        <div className="flex-1">
          <div className="w-full px-8 py-8">
            <UserProfileHeader
              title="Hồ sơ người dùng"
              description="Quản lý thông tin cá nhân và cài đặt tài khoản"
            />

            <div className="bg-white rounded-lg shadow-lg p-8 w-full">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
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

                {/* Information Section */}
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
                            disabled={saving}
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
                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
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
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${editMode
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
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${fieldError.phoneNumber
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
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${editMode
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

                  {/* Change password button */}
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
          </div>

          {/* Maintenance moved to its own page (/maintenance) */}
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
                className={`w-full py-2 rounded-lg font-medium transition-colors ${pwdLoading || !!pwdError
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

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl text-white text-base font-medium transition-all duration-300 flex items-center gap-3 min-w-[300px] max-w-md ${toast.type === "success"
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : toast.type === "error"
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-gradient-to-r from-blue-500 to-blue-600"
            } animate-slide-in-right`}
          style={{
            animation: "slideInRight 0.3s ease-out",
          }}
        >
          <div className="flex-shrink-0">
            {toast.type === "success" ? (
              <CheckCircle className="w-6 h-6" />
            ) : toast.type === "error" ? (
              <XCircle className="w-6 h-6" />
            ) : (
              <Info className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1">
            <p className="text-white font-semibold">{toast.message}</p>
          </div>

          <button
            onClick={() => setToast(null)}
            className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </UserProfileLayout>
  );
}