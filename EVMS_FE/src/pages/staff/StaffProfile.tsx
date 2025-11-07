import React, { useState, useEffect, useRef } from "react";
import { useAuth, type User } from "../../contexts/AuthContext";
import { Eye, EyeOff, Edit, CheckCircle, XCircle, Info, X } from "lucide-react";
import { authApi } from "../../api/AuthApi";
import { compressImage } from "../../api/UploadApi";


export default function StaffProfile() {
  
  const [user, setUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [editMode, setEditMode] = useState(false);
  const [fieldError, setFieldError] = useState<{
    fullName?: string;
    phoneNumber?: string;
  }>({});
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: authUser, updateUser } = useAuth();
  
  // Toast notification state
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Show toast notification
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000); // Auto hide after 3 seconds
  };

  // API function to update current profile (align with TechnicianProfile)
  const updateProfileApi = async (data: Partial<User>) => {
    const response = await authApi.updateProfile({
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      photoURL: data.photoURL,
      gender: (data as any)?.gender,
    });
    return response.data;
  };

  useEffect(() => {
    if (authUser) {
      setUser(authUser as User);
      setEditData(authUser as User);
    }
  }, [authUser]);


  const validateProfile = async () => {
    if (!user?.id) return false;
    if (!editData.fullName) {
      setFieldError({ fullName: "Họ và tên không được để trống" });
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!user?.id) return;
    if (!(await validateProfile())) return;
    
    try {
      await updateProfileApi({
        fullName: editData.fullName,
        phoneNumber: editData.phoneNumber,
        photoURL: editData.photoURL,
      });

      // Refresh profile from server to ensure state is in sync
      const profileResponse = await authApi.getProfile();
      const updatedProfile = profileResponse.data?.data?.user || profileResponse.data?.user || profileResponse.data;

      if (updatedProfile) {
        setUser(updatedProfile as User);
        setEditData(updatedProfile as User);
      } else {
        // Fallback to local state update
        setUser(editData as User);
      }

      setEditMode(false);
      setFieldError({});
      showToast('success', 'Cập nhật thông tin thành công!');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      if (errorMessage?.toLowerCase().includes("số điện thoại")) {
        setFieldError((prev) => ({
          ...prev,
          phoneNumber: errorMessage,
        }));
      }
      showToast('error', errorMessage || 'Cập nhật thông tin thất bại!');
    }
  };

  const handleChangePassword = async () => {
    setPwdError("");
    setPwdLoading(true);
    try {
      if (pwdNew !== pwdConfirm) {
        setPwdError("Mật khẩu xác nhận không khớp");
        setPwdLoading(false);
        return;
      }

      await authApi.changePassword({
        currentPassword,
        newPassword: pwdNew,
      });

      showToast('success', 'Đổi mật khẩu thành công!');
      setShowPwdModal(false);
      setCurrentPassword("");
      setPwdNew("");
      setPwdConfirm("");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setPwdError(
        axiosErr?.response?.data?.message || "Đổi mật khẩu thất bại!"
      );
      showToast('error', axiosErr?.response?.data?.message || 'Đổi mật khẩu thất bại!');
    }
    setPwdLoading(false);
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Use authUser.id if user.id is not available
    const userId = user?.id || (authUser && authUser.id);
    
    if (!userId) {
      showToast('error', "Không tìm thấy thông tin người dùng!");
      return;
    }

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('error', 'Chỉ chấp nhận file JPG, PNG, WEBP');
      return;
    }

    const startTime = performance.now();
    setIsUploadingAvatar(true);

    try {
      // Step 1: Compress image - optimized for avatar (smaller size = faster upload)
      console.log(`📸 Starting compression... Original: ${(file.size / 1024).toFixed(2)}KB`);
      const compressionStart = performance.now();
      const compressedFile = await compressImage(file, 400, 400, 0.5, 150); // Optimized for avatar
      const compressionTime = ((performance.now() - compressionStart) / 1000).toFixed(2);
      const compressedSizeKB = (compressedFile.size / 1024).toFixed(2);
      console.log(`✅ Compression done in ${compressionTime}s: ${compressedSizeKB}KB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reduction)`);

      // Create preview from compressed file
      setAvatarPreview(URL.createObjectURL(compressedFile));

      // Step 2: Upload to Cloudinary using fetch API (no timeout limit)
      console.log(`📤 Starting upload to Cloudinary...`);
      const uploadStart = performance.now();
      const formData = new FormData();
      formData.append('image', compressedFile);

      const baseUrl = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        showToast('error', "Vui lòng đăng nhập lại!");
        setIsUploadingAvatar(false);
        return;
      }

      const uploadResponse = await fetch(`${baseUrl}/uploads/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, browser will set it automatically with boundary
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

      // Step 3: Update profile
      console.log(`💾 Updating profile...`);
      const updateStart = performance.now();
      await authApi.updateProfile({ photoURL: uploadData.imageUrl });
      const updateTime = ((performance.now() - updateStart) / 1000).toFixed(2);
      console.log(`✅ Profile updated in ${updateTime}s`);

      // Fetch updated profile to ensure we have latest data
      try {
        const profileResponse = await authApi.getProfile();
        const updatedProfile = profileResponse.data?.data?.user || profileResponse.data?.user || profileResponse.data;
        if (updatedProfile) {
          setUser(updatedProfile as User);
          setEditData(updatedProfile as User);
          // Update auth context so StaffLayout also gets updated avatar
          updateUser({ photoURL: uploadData.imageUrl });
        } else {
          // Fallback: Update local state if profile fetch fails
          setUser((prev) => (prev ? { ...prev, photoURL: uploadData.imageUrl } : null));
          setEditData((prev) => ({ ...prev, photoURL: uploadData.imageUrl }));
          updateUser({ photoURL: uploadData.imageUrl });
        }
      } catch (profileError) {
        console.warn("Failed to fetch updated profile, using uploaded image URL:", profileError);
        // Fallback: Update local state if profile fetch fails
        setUser((prev) => (prev ? { ...prev, photoURL: uploadData.imageUrl } : null));
        setEditData((prev) => ({ ...prev, photoURL: uploadData.imageUrl }));
        updateUser({ photoURL: uploadData.imageUrl });
      }

      const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`🎉 Total time: ${totalTime}s (Compress: ${compressionTime}s, Upload: ${uploadTime}s, Update: ${updateTime}s)`);
      
      // Show success feedback
      showToast('success', 'Cập nhật ảnh đại diện thành công!');
      setAvatarPreview(null);
    } catch (error: unknown) {
      console.error("❌ Error uploading avatar:", error);
      const errorMsg = error instanceof Error ? error.message : "Không thể tải ảnh lên. Vui lòng thử lại!";
      showToast('error', errorMsg);
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <>
    <div className="bg-[#f6f8fb] flex flex-col items-center py-2 px-2 relative">
      {/* Background decoration */}
      <div className="absolute top-5 left-[-60px] w-40 h-40 bg-cyan-200 rounded-full opacity-40 blur-2xl z-0"></div>
      <div className="absolute top-1/4 left-[-80px] w-48 h-48 bg-pink-200 rounded-full opacity-35 blur-2xl z-0"></div>
      <div className="absolute bottom-10 left-[-40px] w-32 h-32 bg-blue-200 rounded-full opacity-35 blur-2xl z-0"></div>
      <div className="absolute top-10 right-[-60px] w-40 h-40 bg-cyan-200 rounded-full opacity-40 blur-2xl z-0"></div>
      <div className="absolute top-1/2 right-[-80px] w-48 h-48 bg-pink-200 rounded-full opacity-35 blur-2xl z-0"></div>
      <div className="absolute bottom-5 right-[-40px] w-32 h-32 bg-blue-200 rounded-full opacity-35 blur-2xl z-0"></div>

      <div className="bg-white rounded-2xl shadow-sm flex flex-col w-full max-w-5xl overflow-hidden relative">
        <div className="flex flex-row w-full">
          {/* Main Content */}
          <div className="flex-1">
            <div className="max-w-4xl mx-auto">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-1 text-gray-800">
                  Hồ sơ nhân viên
                </h2>
                <p className="text-gray-500 mb-3 text-sm">
                  Quản lý thông tin cá nhân và cài đặt tài khoản của bạn.
                </p>

                {/* Avatar + Name */}
                <div className="flex flex-col items-center mb-6">
                  <div
                    className="relative group cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                      <img
                        src={
                          avatarPreview ||
                          user?.photoURL ||
                          authUser?.photoURL ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || authUser?.fullName || user?.userName || authUser?.userName || 'Staff')}&background=014091&color=fff`
                        }
                        alt="avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to generated avatar if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || authUser?.fullName || user?.userName || authUser?.userName || 'Staff')}&background=014091&color=fff`;
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                      <svg
                        className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  {isUploadingAvatar && (
                    <div className="text-sm text-blue-500 animate-pulse">
                      Đang tải ảnh lên...
                    </div>
                  )}
                  <div className="font-bold text-lg text-gray-800 mb-1">
                    {user?.fullName || "---"}
                  </div>
                </div>
                
                {/* User Info Section */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-20">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Thông tin cá nhân
                    </h3>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="text-blue-600 text-sm font-medium flex items-center gap-1"
                      >
                        <Edit size={14} /> Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setEditData(user || {} as Partial<User>);
                          }}
                          className="text-gray-600 text-sm font-medium"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleUpdate}
                          className="text-blue-600 text-sm font-medium"
                        >
                          Lưu
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-500 text-sm mb-2">
                        Họ và tên
                      </label>
                      <input
                        disabled={!editMode}
                        className={`w-full border border-gray-200 rounded-md px-4 py-2 text-gray-700 ${
                          !editMode ? "bg-gray-50" : "bg-white"
                        }`}
                        value={
                          editMode
                            ? editData.fullName || ""
                            : user?.fullName || ""
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, fullName: e.target.value })
                        }
                      />
                      {fieldError.fullName && (
                        <div className="text-red-500 text-xs mt-1">
                          {fieldError.fullName}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-500 text-sm mb-2">
                        Số điện thoại
                      </label>
                      <input
                        disabled={!editMode}
                        className={`w-full border border-gray-200 rounded-md px-4 py-2 text-gray-700 ${
                          !editMode ? "bg-gray-50" : "bg-white"
                        }`}
                        value={
                          editMode
                            ? editData.phoneNumber || ""
                            : user?.phoneNumber || ""
                        }
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            phoneNumber: e.target.value,
                          })
                        }
                      />
                      {fieldError.phoneNumber && (
                        <div className="text-red-500 text-xs mt-1">
                          {fieldError.phoneNumber}
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-md p-4">
                      <label className="block text-gray-500 text-sm mb-2">
                        Email
                      </label>
                      <div className="text-gray-700 font-medium">
                        {user?.email || ""}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4 flex items-center justify-between">
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">
                          Mật khẩu
                        </label>
                        <div className="text-gray-700 font-medium">••••••</div>
                      </div>
                      <button
                        className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-medium bg-white transition-colors hover:bg-blue-50"
                        onClick={() => setShowPwdModal(true)}
                      >
                        Đổi mật khẩu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="w-full h-20 mt-6 relative">
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              className="w-full"
            >
              <path
                fill="#b1e2f3"
                fillOpacity="1"
                d="M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,128C672,139,768,181,864,176C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* Change Password Modal */}
    {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Đổi mật khẩu</h3>
              <button
                onClick={() => {
                  setShowPwdModal(false);
                  setCurrentPassword("");
                  setPwdNew("");
                  setPwdConfirm("");
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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={pwdLoading}
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
                    type={showPwdNew ? "text" : "password"}
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                    placeholder="Nhập mật khẩu mới"
                    disabled={pwdLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdNew(!showPwdNew)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPwdNew ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPwdConfirm ? "text" : "password"}
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={pwdLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPwdConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
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
                disabled={pwdLoading || !currentPassword || !pwdNew || !pwdConfirm}
                className={`w-full py-2 rounded-lg font-medium ${
                  pwdLoading || !currentPassword || !pwdNew || !pwdConfirm
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
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
          className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl text-white text-base font-medium transition-all duration-300 flex items-center gap-3 min-w-[300px] max-w-md ${
            toast.type === "success"
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : toast.type === "error"
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : "bg-gradient-to-r from-blue-500 to-blue-600"
          } animate-slide-in-right`}
          style={{
            animation: "slideInRight 0.3s ease-out",
          }}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {toast.type === "success" ? (
              <CheckCircle className="w-6 h-6" />
            ) : toast.type === "error" ? (
              <XCircle className="w-6 h-6" />
            ) : (
              <Info className="w-6 h-6" />
            )}
          </div>
          
          {/* Message */}
          <div className="flex-1">
            <p className="text-white font-semibold">{toast.message}</p>
          </div>
          
          {/* Close button */}
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
    </>
  );
}

