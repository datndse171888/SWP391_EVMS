import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import type { AccountRegister } from '../../types/account/Account';
import loginBackground from '../../assets/images/login_background.jpg'
import { Input } from '../../components/ui/input/Input'
import { Button } from '../../components/ui/button/authentication/Button';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api/AuthApi';


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

    if (!account.fullName.trim()) newError.fullName = 'Fullname is required';

    if (!account.email.trim()) {
      newError.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(account.email)) {
      newError.email = 'Please enter a valid email';
    }

    if (!account.phoneNumber.trim()) {
      newError.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(account.phoneNumber)) {
      newError.phoneNumber = 'Please enter a valid phone number';
    }

    if (!account.password) {
      newError.password = 'Password is required';
    } else if (account.password.length < 8) {
      newError.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newError.confirmPassword = 'Confirm password is required';
    } else if (account.password !== confirmPassword) {
      newError.confirmPassword = 'Passwords do not match';
    }

    if(!account.userName.trim()){
      newError.userName = 'Username is required';
    }

     if (!account.gender) {
      newError.gender = 'Please select a gender';
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
      alert('Registration successful! Welcome to EV Service Center Management System.');
    } catch (error) {
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
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to EV Repair</h1>
            <p className="text-gray-600">Join EV Service Center Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" method='POST'>

            {/* Fullname Input */}
            <div>
              <Input
                id="fullname"
                type="text"
                label='Fullname'
                name='fullname'
                value={account.fullName}
                onChange={(e) => setAccount({ ...account, fullName: e.target.value })}
                placeholder="Enter your fullname"
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
                placeholder="Enter your email"
              />
            </div>

            {/* PhoneNumber Input */}
            <div>
              <Input
                id="phoneNumber"
                type="text"
                label='Phone Number'
                name='phoneNumber'
                value={account.phoneNumber}
                onChange={(e) => setAccount({ ...account, phoneNumber: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Username Input */}
            <div>
              <Input
                id="username"
                type="text"
                label='Username'
                name='username'
                value={account.userName}
                onChange={(e) => setAccount({ ...account, userName: e.target.value })}
                placeholder="Enter your username"
              />
            </div>

              {/* Gender Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={account.gender === 'male'}
                    onChange={(e) => setAccount({ ...account, gender: e.target.value })}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={account.gender === 'female'}
                    onChange={(e) => setAccount({ ...account, gender: e.target.value })}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Female</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={account.gender === 'other'}
                    onChange={(e) => setAccount({ ...account, gender: e.target.value })}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Other</span>
                </label>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  label='Password'
                  name='password'
                  value={account.password}
                  onChange={(e) => setAccount({ ...account, password: e.target.value })}
                  placeholder="Enter your password"
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
                  label='Confirm Password'
                  name='confirmPassword'
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm your password"
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
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div >
    </div >
  )
}
