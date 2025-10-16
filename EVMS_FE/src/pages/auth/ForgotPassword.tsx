import React, { useState } from 'react'
import loginBackground from '../../assets/images/login_background.jpg'
import { Input } from '../../components/ui/Input';
import type { ForgotPasswordRequest } from '../../types/Account';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/AuthApi';

export const ForgotPassword: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const [data, setData] = useState<ForgotPasswordRequest>({
        email: ''
    })

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!data.email) {
            setError('Email không được để trống');
            setIsLoading(false);
            return;
        }

        try {
            const response = await authApi.forgotPassword(data);
            console.log(response.data.message);

            // Note: User data will be available after login completes
            // We'll handle redirect in useEffect when user state updates

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Xóa mật khẩu thất bại';
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
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quên mật khẩu</h1>
                        <p className="text-gray-600">Nhập email để khôi phục mật khẩu của bạn</p>
                    </div>

                    <div className="space-y-6">
                        {/* Username Input */}
                        <div>
                            <Input
                                id="email"
                                type="email"
                                label='Email'
                                name='email'
                                value={data.email}
                                onChange={(e) => { setData({ ...data, email: e.target.value }) }}
                                placeholder="youremail@gmail.com"
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
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang xử lý yêu cầu...' : 'Quên mật khẩu'}
                            </Button>
                        </div>
                    </div>

                    {/* Additional Links */}
                    <div className="mt-6 text-center">
                        <a href="/login" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                            Quay lại đăng nhập
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
