import React, { useState } from 'react';
import type { AccountRegister, Gender } from '../../types/Account';
import loginBackground from '../../assets/images/login_background.jpg';
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/AuthApi';
import { Select } from '../../components/ui/Select';
import { validConfirmPassword, validEmail, validPassword, validPhoneNumber } from '../../utils/Validation';
import { useAlert } from '../../hooks/useAlert';


interface FormError {
  [key: string]: string;
}

export const Register: React.FC = () => {
  const [account, setAccount] = useState<AccountRegister>({
    email: '',
    password: '',
    userName: '',
    fullName: '',
    phoneNumber: '',
    photoURL: '',
    role: 'customer',
    gender: 'Male',
  });

  const { showAlert, AlertComponent } = useAlert();

  const [error, setError] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpResendMsg, setOtpResendMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const validateForm = (): boolean => {
    const newError: FormError = {};

    const emailError = validEmail(account.email);
    if (emailError) {
      newError.email = emailError;
    }

    const phoneNumberError = validPhoneNumber(account.phoneNumber);
    if (phoneNumberError) {
      newError.phoneNumber = phoneNumberError;
    }

    const passwordError = validPassword(account.password);
    if (passwordError) {
      newError.password = passwordError;
    }

    const confirmPasswordError = validConfirmPassword(account.password, confirmPassword);
    if (confirmPasswordError) {
      newError.confirmPassword = confirmPasswordError;
    }

    if (!account.userName.trim()) {
      newError.userName = 'Tên đăng nhập không được để trống';
    }

    if (!account.gender) {
      newError.gender = 'Vui lòng chọn giới tính';
    }

    setError(newError);
    return Object.keys(newError).length === 0;
  };

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value, type, checked } = e.target;
  //   setAccount(prev => ({
  //     ...prev,
  //     [name]: type === 'checkbox' ? checked : value
  //   }));

  //   if (error[name]) {
  //     setError(prev => ({ ...prev, [name]: '' }));
  //   }
  // };
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (error.confirmPassword) {
      setError(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await authApi.register(account);
      console.log('Registered user:', response.data);
      // Show OTP form instead of redirecting
      setShowOtp(true);
      showAlert(
        'success',
        'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.',
        5000
      );
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng ký thất bại! Vui lòng thử lại.';
      showAlert('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setOtpError('Vui lòng nhập mã OTP 6 số');
      return;
    }

    setIsVerifying(true);
    setOtpError('');
    setOtpSuccess('');
    setOtpResendMsg('');

    try {
      // 1. Verify OTP
      await authApi.checkOtp(otp);

      // 2. After successful verification, auto login
      const loginResponse = await authApi.login({
        email: account.email,
        password: account.password,
      });

      // 3. Save to localStorage
      if (loginResponse.data.accessToken) {
        localStorage.setItem('token', loginResponse.data.accessToken);
        localStorage.setItem('userId', loginResponse.data.user.id);
        localStorage.setItem('userInfo', JSON.stringify(loginResponse.data.user));
      }

      // 4. Show success and redirect to login
      setOtpSuccess('Xác thực thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Mã OTP không đúng, đã hết hạn hoặc đăng nhập tự động thất bại!';
      setOtpError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    setOtpSuccess('');
    setOtpResendMsg('');

    try {
      await authApi.sendOtp(account.email, account.userName);
      setOtpResendMsg('Đã gửi lại mã OTP! Vui lòng kiểm tra email.');
      setOtp(''); // Clear current OTP input
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể gửi lại OTP. Vui lòng thử lại!';
      setOtpError(errorMessage);
    }
  };
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: `url(${loginBackground})` }}>

      <div className="w-full max-w-4xl">
        {/* Blur container with light background */}
        <div className={`backdrop-blur-xs rounded-2xl shadow-xl border border-white/20 p-8 bg-gradient-to-br from-orange-200 to-blue-200`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {showOtp ? 'Xác thực Email' : 'Chào mừng'}
            </h1>
            <p className="text-gray-600">
              {showOtp 
                ? `Vui lòng nhập mã OTP đã được gửi đến ${account.email}` 
                : 'Đăng ký ngay để trải nghiệm dịch vụ xe điện tốt nhất'}
            </p>
          </div>

          {!showOtp ? (
          <form onSubmit={handleSubmit} className="space-y-6 " method='POST'>

            {/* 2-Column Grid Layout */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Left Column - Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2">
                  Thông tin cá nhân
                </h3>

                {/* Fullname Input */}
                <div>
                  <Input
                    id="fullname"
                    type="text"
                    label='Họ và tên'
                    name='fullname'
                    value={account.fullName}
                    onChange={(e) => setAccount({ ...account, fullName: e.target.value })}
                    placeholder="Nguyen Van A"
                    required={true}
                  />
                </div>

                {/* Email Input */}
                <div>
                  <Input
                    id="email"
                    type="text"
                    label='Email'
                    name='email'
                    value={account.email}
                    onChange={(e) => setAccount({ ...account, email: e.target.value })}
                    placeholder="youremail@gmail.com"
                    required={true}
                  />
                </div>

                {/* PhoneNumber Input */}
                <div>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    label='Số điện thoại'
                    name='phoneNumber'
                    value={account.phoneNumber}
                    onChange={(e) => setAccount({ ...account, phoneNumber: e.target.value })}
                    placeholder="03xxxxxxxx"
                    required={true}
                  />
                </div>

                {/* Gender Selection */}
                <div>
                  <Select
                    label="Giới tính"
                    value={account.gender || ''}
                    onChange={(e) => setAccount({ ...account, gender: e.target.value as Gender })}
                    name='gender'
                    option={[
                      { value: 'Male', label: 'Nam' },
                      { value: 'Female', label: 'Nữ' },
                      { value: 'Other', label: 'Khác' },
                    ]}
                    hiddenDefault={true}
                    required={true}
                  />
                </div>
              </div>

              {/* Right Column - Account Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2">
                  Thông tin tài khoản
                </h3>

                {/* Username Input */}
                <div>
                  <Input
                    id="username"
                    type="text"
                    label='Tên đăng nhập'
                    name='username'
                    value={account.userName}
                    onChange={(e) => setAccount({ ...account, userName: e.target.value })}
                    placeholder="NguyenA123"
                    required={true}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      label='Mật khẩu'
                      name='password'
                      value={account.password}
                      onChange={(e) => setAccount({ ...account, password: e.target.value })}
                      placeholder="Nhập mật khẩu"
                      required={true}
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      label='Xác nhận mật khẩu'
                      name='confirmPassword'
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder="Nhập lại mật khẩu"
                      required={true}
                    />
                  </div>
                </div>


                {/* Error Message */}
                {Object.keys(error).length > 0 && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                    {Object.values(error).join(', ')}
                  </div>
                )}

              </div>
            </div>
            {/* Login Button */}
            <div>
              <Button
                variant="outline"
                size="lg"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </div>

            {/* Additional Links */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          </form>
          ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="max-w-md mx-auto space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã OTP (6 số)
                </label>
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    if (otpError) setOtpError('');
                  }}
                  placeholder="000000"
                  required={true}
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border border-orange-1 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-0 bg-azure-1/70 hover:bg-azure-0/20 focus:bg-blue-1/80 transition-all duration-200"
                />
              </div>

              {/* Error Message */}
              {otpError && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {otpError}
                </div>
              )}

              {/* Success Message */}
              {otpSuccess && (
                <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
                  {otpSuccess}
                </div>
              )}

              {/* Resend Message */}
              {otpResendMsg && (
                <div className="text-blue-600 text-sm text-center bg-blue-50 p-3 rounded-md">
                  {otpResendMsg}
                </div>
              )}

              {/* Submit Button */}
              <div className="w-full">
                <Button
                  variant="outline"
                  size="lg"
                  type="submit"
                  disabled={isVerifying || otp.length !== 6}
                >
                  {isVerifying ? 'Đang xác thực...' : 'Xác nhận'}
                </Button>
              </div>

              {/* Resend OTP Button */}
              <div className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendOtp}
                >
                  Gửi lại mã OTP
                </Button>
              </div>

              {/* Back to Register */}
              <button
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setOtp('');
                  setOtpError('');
                  setOtpSuccess('');
                  setOtpResendMsg('');
                }}
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm w-full text-center"
              >
                ← Quay lại đăng ký
              </button>
            </div>
          </form>
          )}
        </div>
      </div >

      {AlertComponent}
    </div >
  )
}
