import React, { useState } from 'react'
import { Input } from '../../components/ui/input/authentication/Input'
import { Button } from '../../components/ui/button/authentication/Button';

export const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="w-full max-w-md">
        {/* Blur container with light background */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Input */}
            <div>
              <Input
                id="username"
                type="text"
                label='Username'
                name='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {/* Login Button */}
            <div>
              <Button variant="primary" size="lg" type="submit">Login</Button>
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

