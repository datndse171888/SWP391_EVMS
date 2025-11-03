import { useState, useEffect, useRef } from "react";
import {
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Filter,
  CalendarDays,
  X,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../api/AuthApi";
import { technicianApi } from "../../api/TechnicianApi";
import { compressImage } from "../../api/UploadApi";
import type { AxiosError } from "axios";
import React from "react";

// Interfaces
interface ICertificate {
  certificateID?: string;
  title?: string;
  type?: string;
  issuedBy?: string;
  issuedDate: string;
  expiryDate?: string;
  status?: string;
  note?: string;
  description?: string;
  fileUrl?: string;
  certificateImage: string;
}

interface ITechnician {
  id?: string;
  introduction?: string;
  role?: 'leader' | 'member';
  experience?: number;
  startDate?: string;
}

const DEFAULT_CERT_IMAGE =
  "https://cdn.prod.website-files.com/60a530a795c0ca8a81c5868a/660568c3773236b1fdefc245_badge-preview%20(2)%2011.46.22.png";

export default function TechnicianProfile() {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(authUser);
  const [editData, setEditData] = useState<Partial<typeof authUser>>({});
  const [editMode, setEditMode] = useState(false);
  const [technician, setTechnician] = useState<ITechnician | null>(null);
  const [certificates, setCertificates] = useState<ICertificate[]>([]);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
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
  const [modalCertificate, setModalCertificate] = useState(false);
  const [initialCertificateData, setInitialCertificateData] = useState<
    Omit<ICertificate, "certificateID">
  >({
    title: "",
    type: "",
    issuedBy: "",
    issuedDate: "",
    expiryDate: "",
    description: "",
    note: "",
    certificateImage: "",
  });
  const [editTechnician, setEditTechnician] = useState(false);
  const [technicianEditData, setTechnicianEditData] = useState<
    Partial<ITechnician>
  >({});
  const [certificateFilter, setCertificateFilter] = useState("all");
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync user state with authUser from context (only when id changes)
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setEditData(authUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]); // Only depend on id to avoid infinite loop

  // Fetch profile once when component mounts to get latest photoURL
  // Don't update context here to avoid infinite loops
  useEffect(() => {
    if (!authUser?.id) return;
    
    let isMounted = true;
    const fetchUserProfile = async () => {
      try {
        // Fetch latest profile to get updated photoURL
        const profileRes = await authApi.getProfile();
        // Check different possible response structures
        const updatedUser = profileRes.data?.user || profileRes.data?.data?.user || profileRes.data;
        if (isMounted && updatedUser && updatedUser.id === authUser.id) {
          // Only update local state, don't update context to avoid infinite loops
          setUser(updatedUser);
          setEditData(updatedUser);
        }
      } catch {
        // Silently fail, use authUser from context
      }
    };
    
    fetchUserProfile();
    
    return () => {
      isMounted = false;
    };
    // Only fetch once on mount, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    const fetchTechnician = async () => {
      if (!user?.id) return;
      try {
        const res = await technicianApi.getTechnicianInfo(user.id);
        const techData = res.data?.data?.technician;
        if (techData) {
          setTechnician({
            id: techData.id,
            introduction: techData.introduction,
            role: techData.role,
            experience: techData.experience,
            startDate: techData.startDate,
          });
        }
      } catch {
        console.error("Lỗi khi tải dữ liệu kỹ thuật viên");
      }
    };

    if (user?.id) fetchTechnician();
  }, [user?.id]);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user?.id) return;
      try {
        const res = await technicianApi.getTechnicianCertificates(user.id);
        const certs = res.data?.data?.certificates || [];
        setCertificates(
          certs.map((cert) => ({
            certificateID: cert.certificateID,
            issuedDate: cert.issuedDate,
            expiryDate: cert.expiryDate,
            status: cert.status,
            note: cert.note,
            certificateImage: cert.certificateImage,
            title: cert.note || "Chứng chỉ",
          }))
        );
      } catch (err) {
        console.error("Lỗi khi tải chứng chỉ:", err);
        setCertificates([]);
      }
    };

    if (user?.id) fetchCertificates();
  }, [user?.id]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2000);
  };

  const validateProfile = async () => {
    if (!user?.id || !editData) return false;
    if (!editData.fullName) {
      setFieldError({ fullName: "Họ và tên không được để trống" });
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!user?.id || !editData) return;
    if (!(await validateProfile())) return;
    try {
      await authApi.updateProfile({
        fullName: editData.fullName,
        phoneNumber: editData.phoneNumber,
        photoURL: editData.photoURL,
      });
      const updated = { ...user, ...editData };
      setUser(updated);
      setEditData(updated);
      if (editData) {
        updateUser(editData);
      }
      setEditMode(false);
      showToast("success", "Cập nhật thành công!");
    } catch {
      showToast("error", "Cập nhật thất bại!");
    }
  };

  const handleBlurField = async (
    field: "fullName" | "phoneNumber",
    value: string
  ) => {
    if (!user?.id) return;
    try {
      await authApi.updateProfile({ [field]: value });
      setFieldError((prev) => ({ ...prev, [field]: undefined }));
      showToast("success", "Cập nhật thành công!");
      const updated = { ...user, [field]: value };
      setUser(updated);
      setEditData(updated);
      updateUser({ [field]: value });
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr?.response?.data?.message) {
        setFieldError((prev) => ({
          ...prev,
          [field]: axiosErr.response!.data.message!,
        }));
      }
    }
  };

  const handleChangePassword = async () => {
    setPwdError("");
    if (!currentPassword || !pwdNew || !pwdConfirm) {
      setPwdError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError("Mật khẩu mới không khớp!");
      return;
    }
    setPwdLoading(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword: pwdNew,
      });
      setShowPwdModal(false);
      setCurrentPassword("");
      setPwdNew("");
      setPwdConfirm("");
      showToast("success", "Đổi mật khẩu thành công!");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setPwdError(
        axiosErr?.response?.data?.message || "Đổi mật khẩu thất bại!"
      );
    }
    setPwdLoading(false);
  };

  const handleCertificateSubmit = async () => {
    // Note: Certificate create/update API may not be available yet
    // This is a placeholder for future implementation
    showToast("error", "Chức năng quản lý chứng chỉ đang được phát triển.");
  };

  const handleDeleteCertificate = async () => {
    // Note: Certificate delete API may not be available yet
    showToast("error", "Chức năng xóa chứng chỉ đang được phát triển.");
  };

  const handleTechnicianEdit = () => {
    if (!technician) return;
    setTechnicianEditData(technician);
    setEditTechnician(true);
  };

  const handleTechnicianCancel = () => {
    setEditTechnician(false);
  };

  const handleTechnicianSave = async () => {
    // Note: Update technician API may need to be implemented
    showToast("error", "Chức năng cập nhật thông tin kỹ thuật viên đang được phát triển.");
  };


  const filteredCertificates = certificates.filter((cert) => {
    if (certificateFilter === "all") return true;
    if (!cert.expiryDate) return false;
    const now = new Date();
    const expireDate = new Date(cert.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (certificateFilter === "expired") return expireDate < now;
    if (certificateFilter === "expiring_soon")
      return expireDate >= now && expireDate <= thirtyDaysFromNow;
    if (certificateFilter === "valid") return expireDate > thirtyDaysFromNow;
    return true;
  });

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

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
        if (updatedProfile && updatedProfile.id === user.id) {
          setUser(updatedProfile);
          setEditData(updatedProfile);
          // Update auth context so other components also get updated avatar
          updateUser({ photoURL: uploadData.imageUrl });
        } else {
          // Fallback: Update local state if profile fetch fails
          const updated = { ...user, photoURL: uploadData.imageUrl };
          setUser(updated);
          setEditData(updated);
          updateUser({ photoURL: uploadData.imageUrl });
        }
      } catch (profileError) {
        console.warn("Failed to fetch updated profile, using uploaded image URL:", profileError);
        // Fallback: Update local state if profile fetch fails
        const updated = { ...user, photoURL: uploadData.imageUrl };
        setUser(updated);
        setEditData(updated);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center">
        <div className="text-gray-500">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex flex-col items-center py-4 px-2 relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 left-[-80px] w-60 h-60 bg-cyan-200 rounded-full opacity-40 blur-2xl z-0"></div>
      <div className="absolute top-1/3 left-[-100px] w-72 h-72 bg-pink-200 rounded-full opacity-35 blur-2xl z-0"></div>
      <div className="absolute bottom-20 left-[-60px] w-44 h-44 bg-blue-200 rounded-full opacity-35 blur-2xl z-0"></div>
      <div className="absolute top-20 right-[-80px] w-60 h-60 bg-cyan-200 rounded-full opacity-40 blur-2xl z-0"></div>
      <div className="absolute top-1/2 right-[-100px] w-72 h-72 bg-pink-200 rounded-full opacity-35 blur-2xl z-0"></div>
      <div className="absolute bottom-10 right-[-60px] w-44 h-44 bg-blue-200 rounded-full opacity-35 blur-2xl z-0"></div>

      <div className="bg-white rounded-3xl shadow-sm flex flex-col w-full max-w-6xl overflow-hidden relative">
        <div className="flex flex-row w-full">
          {/* Main Content */}
          <div className="flex-1">
            <div className="max-w-4xl mx-auto">
              <div className="p-7">
                <div className="flex items-start gap-3 mb-8">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
                    title="Quay lại"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Hồ sơ kỹ thuật viên
                    </h2>
                    <p className="text-gray-500">
                      Quản lý thông tin cá nhân, chuyên môn và các chứng chỉ của
                      bạn.
                    </p>
                  </div>
                </div>

                {/* Avatar + Name */}
                <div className="flex flex-col items-center mb-8">
                  <div
                    className="relative group cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden">
                      <img
                        src={
                          avatarPreview ||
                          user?.photoURL ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.userName || 'Technician')}&background=014091&color=fff`
                        }
                        alt="avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to generated avatar if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.userName || 'Technician')}&background=014091&color=fff`;
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                      <svg
                        className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
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
                    {user?.fullName || user?.userName || "---"}
                  </div>
                </div>
                {/* User Info Section */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-700 mb-6">
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
                            setEditData(user || {});
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            ? editData?.fullName || ""
                            : user?.fullName || ""
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, fullName: e.target.value })
                        }
                        onBlur={(e) =>
                          handleBlurField("fullName", e.target.value)
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
                            ? editData?.phoneNumber || ""
                            : user?.phoneNumber || ""
                        }
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            phoneNumber: e.target.value,
                          })
                        }
                        onBlur={(e) =>
                          handleBlurField("phoneNumber", e.target.value)
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

                {/* Technician Info Section */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-700 mb-6">
                      Thông tin kỹ thuật viên
                    </h3>
                    {!editTechnician ? (
                      <button
                        onClick={handleTechnicianEdit}
                        className="text-blue-600 text-sm font-medium flex items-center gap-1"
                      >
                        <Edit size={14} /> Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleTechnicianCancel}
                          className="text-gray-600 text-sm font-medium"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleTechnicianSave}
                          className="text-blue-600 text-sm font-medium"
                        >
                          Lưu
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-500 text-sm mb-2">
                        Vai trò
                      </label>
                      <div className="text-gray-700 font-medium bg-gray-50 rounded-md p-4">
                        {technician?.role === "leader"
                          ? "Leader"
                          : technician?.role === "member"
                          ? "Member"
                          : "---"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-sm mb-2">
                        Kinh nghiệm (năm)
                      </label>
                      <div className="text-gray-700 font-medium bg-gray-50 rounded-md p-4">
                        {technician?.experience || 0} năm
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-500 text-sm mb-2">
                        Giới thiệu bản thân
                      </label>
                      <textarea
                        rows={4}
                        className={`w-full border border-gray-200 rounded-md px-4 py-2 text-gray-700 ${
                          !editTechnician ? "bg-gray-50" : "bg-white"
                        }`}
                        placeholder="Viết một vài dòng giới thiệu về kinh nghiệm và chuyên môn của bạn..."
                        value={
                          editTechnician
                            ? technicianEditData.introduction || ""
                            : technician?.introduction || ""
                        }
                        onChange={(e) =>
                          editTechnician &&
                          setTechnicianEditData({
                            ...technicianEditData,
                            introduction: e.target.value,
                          })
                        }
                        disabled={!editTechnician}
                      />
                    </div>
                  </div>
                </div>

                {/* Certificates Section */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-gray-700">
                      Quản lý chứng chỉ
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-500" />
                        <select
                          value={certificateFilter}
                          onChange={(e) => setCertificateFilter(e.target.value)}
                          className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">Tất cả</option>
                          <option value="valid">Còn hạn</option>
                          <option value="expiring_soon">Sắp hết hạn</option>
                          <option value="expired">Đã hết hạn</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          setInitialCertificateData({
                            title: "",
                            type: "",
                            issuedBy: "",
                            issuedDate: "",
                            expiryDate: "",
                            description: "",
                            note: "",
                            certificateImage: "",
                          });
                          setModalCertificate(true);
                        }}
                        className="text-blue-600 text-sm font-medium flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md"
                      >
                        <PlusCircle size={14} /> Thêm chứng chỉ
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCertificates.length === 0 ? (
                      <p className="text-gray-500 italic md:col-span-2">
                        Không có chứng chỉ nào phù hợp.
                      </p>
                    ) : (
                      filteredCertificates.map((cert) => (
                        <div
                          key={cert.certificateID}
                          className="relative aspect-video rounded-lg overflow-hidden group shadow-lg bg-gray-200 cursor-pointer"
                          onClick={() => setViewImageUrl(cert.certificateImage)}
                        >
                          <img
                            src={cert.certificateImage || DEFAULT_CERT_IMAGE}
                            alt={cert.title || "Chứng chỉ"}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_CERT_IMAGE;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h4 className="font-bold text-lg truncate">
                              {cert.title || cert.note || "Chứng chỉ"}
                            </h4>
                            <div className="flex items-center text-xs opacity-80 gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <CalendarDays size={12} />
                                <span>
                                  Cấp:{" "}
                                  {new Date(cert.issuedDate).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                              </div>
                              {cert.expiryDate && (
                                <div className="flex items-center gap-1">
                                  <CalendarDays size={12} />
                                  <span>
                                    Hết hạn:{" "}
                                    {new Date(
                                      cert.expiryDate
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInitialCertificateData({
                                  title: cert.title || "",
                                  type: cert.type || "",
                                  issuedBy: cert.issuedBy || "",
                                  issuedDate: cert.issuedDate,
                                  expiryDate: cert.expiryDate || "",
                                  description: cert.description || "",
                                  note: cert.note || "",
                                  certificateImage: cert.certificateImage,
                                });
                                setModalCertificate(true);
                              }}
                              className="bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full hover:bg-white"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCertificate();
                              }}
                              className="bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full hover:bg-white"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="w-full h-40 mt-12 relative">
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

      {/* Image Viewer Modal */}
      {viewImageUrl && (
        <div
          className="fixed inset-0 z-[1001] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm"
          onClick={() => setViewImageUrl(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/80 hover:text-white z-10"
            onClick={() => setViewImageUrl(null)}
          >
            <X size={32} />
          </button>
          <img
            src={viewImageUrl}
            alt="Certificate full view"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_CERT_IMAGE;
            }}
          />
        </div>
      )}

      {/* Toasts */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-base font-semibold transition-all ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Password Change Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Đổi mật khẩu
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-2">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? "text" : "password"}
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowCurrentPwd((v) => !v)}
                  >
                    {showCurrentPwd ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPwdNew ? "text" : "password"}
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    placeholder="Mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPwdNew((v) => !v)}
                  >
                    {showPwdNew ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPwdConfirm ? "text" : "password"}
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                    value={pwdConfirm}
                    onChange={(e) => {
                      setPwdConfirm(e.target.value);
                      if (pwdNew !== e.target.value) {
                        setPwdError("Mật khẩu không khớp.");
                      } else {
                        setPwdError("");
                      }
                    }}
                    placeholder="Xác nhận mật khẩu"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPwdConfirm((v) => !v)}
                  >
                    {showPwdConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              {pwdError && (
                <div className="text-red-500 text-xs">{pwdError}</div>
              )}
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-blue-600 text-white py-2 rounded font-medium"
                  onClick={handleChangePassword}
                  disabled={pwdLoading}
                >
                  {pwdLoading ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
                <button
                  className="px-4 text-gray-600 hover:text-gray-800"
                  onClick={() => {
                    setShowPwdModal(false);
                    setCurrentPassword("");
                    setPwdNew("");
                    setPwdConfirm("");
                    setPwdError("");
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {modalCertificate && (
        <CertificateModal
          initialData={initialCertificateData}
          onClose={() => setModalCertificate(false)}
          onSubmit={handleCertificateSubmit}
        />
      )}
    </div>
  );
}

// Certificate Modal Component
function CertificateModal({
  initialData,
  onClose,
  onSubmit,
}: {
  initialData: Omit<ICertificate, "certificateID">;
  onClose: () => void;
  onSubmit: () => void;
}): React.ReactElement {
  const [data, setData] = useState(initialData);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Chỉ chấp nhận file ảnh.");
      return;
    }
    // Validate file size (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Kích thước file không được vượt quá 5MB.");
      return;
    }
    setUploading(true);
    try {
      // Compress image before upload for certificates (larger size allowed)
      const compressedFile = await compressImage(file, 1920, 1920, 0.6, 500);
      
      const formData = new FormData();
      formData.append('image', compressedFile);

      const baseUrl = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setUploadError("Vui lòng đăng nhập lại!");
        setUploading(false);
        return;
      }

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
      
      if (!uploadData.imageUrl) {
        throw new Error('No imageUrl in response');
      }

      setData((prev) => ({ ...prev, certificateImage: uploadData.imageUrl }));
    } catch (error: unknown) {
      console.error("Error uploading certificate image:", error);
      const errorMsg = error instanceof Error ? error.message : "Tải ảnh lên thất bại.";
      setUploadError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-6 text-gray-900">
          {initialData.title ? "Chỉnh sửa" : "Thêm mới"} Chứng chỉ
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Tên chứng chỉ
            </label>
            <input
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={data.title || ""}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Loại chứng chỉ
            </label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={data.type || ""}
              onChange={(e) => setData({ ...data, type: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Đơn vị cấp
            </label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={data.issuedBy || ""}
              onChange={(e) => setData({ ...data, issuedBy: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">Ngày cấp</label>
            <input
              required
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={data.issuedDate}
              onChange={(e) => setData({ ...data, issuedDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Ngày hết hạn (nếu có)
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={data.expiryDate || ""}
              onChange={(e) => setData({ ...data, expiryDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">Mô tả</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={data.description || ""}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Link file chứng chỉ (URL)
            </label>
            <div className="flex flex-col gap-2">
              <input
                placeholder="https://example.com/certificate.jpg"
                type="url"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={data.certificateImage}
                onChange={(e) =>
                  setData({ ...data, certificateImage: e.target.value })
                }
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Đang tải..." : "Tải ảnh từ thiết bị"}
                </button>
                {uploadError && (
                  <span className="text-red-500 text-xs ml-2">
                    {uploadError}
                  </span>
                )}
              </div>
              {data.certificateImage && (
                <div className="mt-2">
                  <img
                    src={data.certificateImage}
                    alt="Preview"
                    className="max-h-40 rounded border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_CERT_IMAGE;
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 font-medium px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

