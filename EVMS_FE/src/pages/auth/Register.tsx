import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { AccountRegister } from '../../types/Account';
import loginBackground from '../../assets/images/login_background.jpg';
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/AuthApi';
import { Select } from '../../components/ui/Select';


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
    gender: '',
  });

  const [error, setError] = useState<FormError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);




  const validateForm = (): boolean => {
    const newError: FormError = {};

    if (!account.fullName.trim()) newError.fullName = 'Họ và tên không được để trống';

    if (!account.email.trim()) {
      newError.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(account.email)) {
      newError.email = 'Sai định dạng email';
    }

    if (!account.phoneNumber.trim()) {
      newError.phoneNumber = 'Số điện thoại không được để trống';
    } else if (!/^\+?[\d\s-()]+$/.test(account.phoneNumber)) {
      newError.phoneNumber = 'Sai định dạng số điện thoại';
    }

    if (!account.password) {
      newError.password = 'Mật khẩu không được để trống';
    } else if (account.password.length < 8) {
      newError.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (!confirmPassword) {
      newError.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (account.password !== confirmPassword) {
      newError.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
      await authApi.register(account);
      alert('Registration successful! Welcome to EV Service Center Management System.');
    } catch {
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: `url(${loginBackground})` }}>
      <div className="w-full max-w-md">
        {/* Blur container with light background */}
        <div className={`backdrop-blur-xs rounded-2xl shadow-xl border border-white/20 p-8 bg-gradient-to-br from-orange-200 to-blue-200`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng</h1>
            <p className="text-gray-600">Đăng ký ngay để trải nghiệm dịch vụ xe điện tốt nhất</p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-6" method='POST'>

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
              />
            </div>

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
              />
            </div>

            {/* Gender Selection */}
            <div>
              <Select
                label="Giới tính"
                value={account.gender || ''}
                onChange={(e) => setAccount({ ...account, gender: e.target.value })}
                name='gender'
                option={[
                  {value: '', label: 'Chọn giới tính'},
                  { value: 'Male', label: 'Nam' },
                  { value: 'Female', label: 'Nữ' },
                  { value: 'Other', label: 'Khác' },
                ]} />
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  label='Mật khẩu'
                  name='password'
                  value={account.password}
                  onChange={(e) => setAccount({ ...account, password: e.target.value })}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  style={{ marginTop: '2px' }} // Adjust based on your Input component's label height
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  label='Xác nhận mật khẩu'
                  name='confirmPassword'
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  style={{ marginTop: '2px' }} // Adjust based on your Input component's label height
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>


            {/* Error Message */}
            {Object.keys(error).length > 0 && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {Object.values(error).join(', ')}
              </div>
            )}

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
    </div >
  )
}
