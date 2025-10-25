import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { Eye, EyeOff, Edit } from "lucide-react";

interface User {
  _id?: string;
  username?: string;
  email?: string;
  password?: string;
  photoUrl?: string;
  fullName?: string;
  phoneNumber?: string;
  role?: "admin" | "staff" | "technician" | "customer";
  gender?: string;
  yearOfBirth?: number;
  isVerified?: boolean;
  isDisabled?: boolean;
}


export default function StaffProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<User>({});
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      setUser(authUser as User);
      setEditData(authUser as User);
    }
  }, [authUser]);


  const validateProfile = async () => {
    if (!user?._id) return false;
    if (!editData.fullName) {
      setFieldError({ fullName: "Họ và tên không được để trống" });
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!user?._id) return;
    if (!(await validateProfile())) return;
    
    try {
      // Update user profile logic here
      setUser(editData);
      setEditMode(false);
      setFieldError({});
      // toast.success("Cập nhật thông tin thành công!");
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      if (errorMessage?.toLowerCase().includes("số điện thoại")) {
        setFieldError((prev) => ({
          ...prev,
          phoneNumber: errorMessage,
        }));
      }
    }
  };

  const handleChangePassword = async () => {
    setPwdError("");
    setPwdLoading(true);
    try {
      // Change password logic here
      setShowPwdModal(false);
      setCurrentPassword("");
      setPwdNew("");
      setPwdConfirm("");
      // toast.success("Đổi mật khẩu thành công!");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setPwdError(
        axiosErr?.response?.data?.message || "Đổi mật khẩu thất bại!"
      );
    }
    setPwdLoading(false);
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        "http://localhost:5000/api/uploads/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.imageUrl) {
        // Update avatar URL in database
        if (user?._id) {
          // Update user avatar logic here
          const updated = { ...user, photoUrl: response.data.imageUrl };
          setUser(updated);
          setEditData(updated);
        }

        alert("Cập nhật ảnh đại diện thành công!");
      } else {
        alert("Không nhận được URL ảnh từ server!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.");
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
                        src={user?.photoUrl || "https://i.pravatar.cc/150?img=3"}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
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
    </>
  );
}

