import React, { useState } from 'react'
import type { ResetPasswordRequest } from '../../types/Account';
import loginBackground from '../../assets/images/login_background.jpg'
import { authApi } from '../../api/AuthApi';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const ResetPassword: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState<ResetPasswordRequest>({
    token: new URLSearchParams(window.location.search).get('token') || '',
    newPassword: ''
  });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (data.newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      setIsLoading(false);
      return;
    }

    try {
      await authApi.resetPassword(data);
      // Redirect to login page after successful password reset
      navigate('/login');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Tạo mật khẩu mới thất bại';
      setError(errorMessage);
    }
    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: `url(${loginBackground})` }}>
      <div className="w-full max-w-md">
        {/* Blur container with light background */}
        <div className={`backdrop-blur-xs rounded-2xl shadow-xl border border-white/20 p-8 bg-gradient-to-br from-orange-200 to-blue-200`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo mật khẩu mới</h1>
            <p className="text-gray-600">Tạo mật khẩu mới để bảo mật tài khoản của bạn</p>
          </div>

          <div className="space-y-6">
            {/* Password Input */}
            <div>
              <Input
                id="password"
                type="password"
                label='Mật khẩu mới'
                name='password'
                value={data.newPassword}
                onChange={(e) => setData({ ...data, newPassword: e.target.value })}
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div>
              <Input
                id="password"
                type="password"
                label='Nhập lại mật khẩu mới'
                name='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Login Button */}
            <div>
              <Button
                variant="outline"
                size="lg"
                type="submit"
                onClick={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? 'Đang tạo...' : 'Tạo mật khẩu mới'}
              </Button>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              Mật khẩu phải có ít nhất 6 ký tự
            </p>

            <div className="text-sm text-gray-600 mt-2">
              Nên dùng đa dạng loại kí tự{' '}
              <p
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
              >
                (chữ hoa, chữ thường, số, ký tự đặc biệt)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
