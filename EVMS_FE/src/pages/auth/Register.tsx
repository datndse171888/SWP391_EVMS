import React, { useState } from 'react';
import type { AccountRegister, Gender, UserResponse } from '../../types/Account';
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

  const validateForm = (): boolean => {
    const newError: FormError = {};

    let emailError = validEmail(account.email);
    if (emailError) {
      newError.email = emailError;
    }

    let phoneNumberError = validPhoneNumber(account.phoneNumber);
    if (phoneNumberError) {
      newError.phoneNumber = phoneNumberError;
    }

    let passwordError = validPassword(account.password);
    if (passwordError) {
      newError.password = passwordError;
    }

    let confirmPasswordError = validConfirmPassword(account.password, confirmPassword);
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

    // Simulate API call
    try {
      const response = await authApi.register(account);
      const data: UserResponse = response.data;
      console.log('Registered user:', data);
      showAlert(
        'success',
        'Đăng ký thành công! Vui lòng đợi mail để kích hoạt tài khoản.',
        5000,
        () => navigate('/login')
      );
    } catch {
      showAlert('error', 'Đăng ký thất bại! Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: `url(${loginBackground})` }}>

      <div className="w-full max-w-4xl">
        {/* Blur container with light background */}
        <div className={`backdrop-blur-xs rounded-2xl shadow-xl border border-white/20 p-8 bg-gradient-to-br from-orange-200 to-blue-200`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng</h1>
            <p className="text-gray-600">Đăng ký ngay để trải nghiệm dịch vụ xe điện tốt nhất</p>
          </div>

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
          </form>

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
        </div>
      </div >

      {AlertComponent}
    </div >
  )
}
