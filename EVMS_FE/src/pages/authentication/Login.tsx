import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../components/ui/input/Input'
import { Button } from '../../components/ui/button/authentication/Button';
import type { AccountLogin } from '../../types/account/Account';
import loginBackground from '../../assets/images/login_background.jpg'
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading, user } = useAuth();
  const [error, setError] = useState<string>('');

  const [account, setAccount] = useState<AccountLogin>({
    email: '',
    password: ''
  });

  // Handle redirect after successful login
  useEffect(() => {
    if (user && !isLoading) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        case 'technician':
          navigate('/technician/dashboard');
          break;
        case 'customer':
          navigate('/');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(account.email, account.password);

      // Note: User data will be available after login completes
      // We'll handle redirect in useEffect when user state updates

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      setError(errorMessage);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setError('');
      const credential = credentialResponse.credential;
      if (!credential) {
        throw new Error('Không nhận được mã xác thực từ Google');
      }

      interface GoogleJwtPayload { email?: string; name?: string; picture?: string }
      const decoded = jwtDecode<GoogleJwtPayload>(credential);
      const email: string = decoded?.email ?? '';
      const userName: string = decoded?.name || (email ? email.split('@')[0] : 'google_user');
      const photoURL: string | undefined = decoded?.picture || undefined;

      if (!email) {
        throw new Error('Không lấy được email từ Google');
      }

      await loginWithGoogle({ email, userName, photoURL });
      // redirect is handled by useEffect when user updates
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đăng nhập Google thất bại';
      setError(errorMessage);
    }
  };

  const handleGoogleError = () => {
    setError('Không thể đăng nhập với Google. Vui lòng thử lại.');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: `url(${loginBackground})` }}>
      <div className="w-full max-w-md">
        {/* Blur container with light background */}
        <div className={`backdrop-blur-xs rounded-2xl shadow-xl border border-white/20 p-8 bg-gradient-to-br from-orange-200 to-blue-200`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Nhập</h1>
            <p className="text-gray-600">Kết nối mọi sự kiện - Khởi tạo trải nghiệm</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" method='GET'>
            {/* Username Input */}
            <div>
              <Input
                id="email"
                type="email"
                label='Email'
                name='email'
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                placeholder="youremail@gmail.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <Input
                id="password"
                type="password"
                label='Mật khẩu'
                name='password'
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
                placeholder="Nhập mật khẩu"
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
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </div>
          </form>

          {/* Or divider and Google Login Button */}
          <div className="mt-4">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/40"></div>
              <span className="mx-4 text-gray-700 text-sm">hoặc</span>
              <div className="flex-grow border-t border-white/40"></div>
            </div>

            <div className="mt-4 w-full">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap />
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              Quên mật khẩu?
            </a>

            <div className="text-sm text-gray-600 mt-2">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

