import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../components/ui/input/authentication/Input'
import { Button } from '../../components/ui/button/authentication/Button';
import type { AccountLogin } from '../../types/account/Account';
import loginBackground from '../../assets/images/login_background.jpg'
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string>('');

  const [account, setAccount] = useState<AccountLogin>({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(account.email, account.password);
      
      // Redirect to appropriate dashboard based on user role
      navigate('/');
      
    } catch (error: any) {
      setError(error.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: `url(${loginBackground})` }}>
      <div className="w-full max-w-md">
        {/* Blur container with light background */}
        <div className={`backdrop-blur-xs rounded-2xl shadow-xl border border-white/20 p-8 bg-gradient-to-br from-orange-200 to-blue-200`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" method='GET'>
            {/* Username Input */}
            <div>
              <Input
                id="username"
                type="text"
                label='Username'
                name='username'
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                placeholder="Enter your username"
              />
            </div>

            {/* Password Input */}
            <div>
              <Input
                id="password"
                type="password"
                label='Password'
                name='password'
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
                placeholder="Enter your password"
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

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

