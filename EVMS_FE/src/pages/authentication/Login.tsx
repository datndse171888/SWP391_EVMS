import React, { useState } from 'react'
import { Input } from '../../components/ui/input/authentication/Input'
import { Button } from '../../components/ui/button/authentication/Button';
import type { AccountLogin } from '../../types/account/Account';
import loginBackground from '../../assets/images/login_background.jpg'
import { authApi } from '../../services/api/AuthApi';

export const Login: React.FC = () => {

  const [account, setAccount] = useState<AccountLogin>({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authApi.login(account);
      
      // Handle successful login
      const { accessToken, user } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', user);
      
      // Redirect to dashboard or home page
      // navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      // Handle login error (show toast, set error state, etc.)
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

            {/* Login Button */}
            <div>
              <Button variant="outline" size="lg" type="submit">Login</Button>
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

