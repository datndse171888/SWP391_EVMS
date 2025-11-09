import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/AuthApi';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyOTP: React.FC = () => {
  const { user, updateUserInfo } = useAuth();
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ⚠️ Nếu user đã verify hoặc chưa login → redirect về trang chủ
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.isVerified) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Chỉ hiển thị trang nếu user đã login và chưa verify
  if (!user || user.isVerified) {
    return null;
  }

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Gọi API gửi lại OTP
      await authApi.sendOtp(user.email, user.userName);

      setSuccess('Mã OTP đã được gửi đến email của bạn');
      setOtpSent(true);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Có lỗi xảy ra khi gửi OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Vui lòng nhập mã OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // 1. Gọi API kiểm tra OTP
      await authApi.checkOtp(otp);

      // 2. Cập nhật thông tin user trong context
      await updateUserInfo();

      // 3. Hiển thị thông báo thành công
      setSuccess('Xác thực tài khoản thành công! Đang chuyển hướng...');

      // 4. Redirect về trang chủ sau 2 giây
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Có lỗi xảy ra khi xác thực OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Xác thực tài khoản</h1>
          <p className="text-gray-600 text-sm">
            Vui lòng xác thực email của bạn để sử dụng đầy đủ tính năng
          </p>
        </div>

        {!otpSent ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Nhấn nút bên dưới để nhận mã xác thực qua email
            </p>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  <span>Gửi mã xác thực</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Nhập mã OTP từ email của bạn
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setError('');
                }}
                placeholder="000000"
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
              />
              <p className="mt-2 text-xs text-gray-500">
                Mã OTP đã được gửi đến: <span className="font-semibold">{user.email}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gửi lại mã
              </button>
              <button
                type="submit"
                disabled={loading || !otp}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  'Xác thực'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;

