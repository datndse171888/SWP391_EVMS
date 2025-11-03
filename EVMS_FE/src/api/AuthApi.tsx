import type { AccountLogin, ForgotPasswordRequest, LoginResponse, ResetPasswordRequest, UserResponse } from "../types/Account";
import type { AccountRegister } from "../types/Account";
import { api } from "../utils/Axios";

// Auth API methods
export const authApi = {
  login: (credentials: AccountLogin) => {
    return api.post<LoginResponse>('/auth/login', credentials);
  },

  loginWithGoogle: (data: { email: string; userName: string; photoURL?: string }) => {
    return api.post('/auth/google-login', data);
  },

  register: (userData: AccountRegister) => {
    return api.post<UserResponse>('/auth/register', userData);
  },

  logout: () => {
    // Since we're using JWT, logout is handled client-side
    // by removing the token from localStorage
    return Promise.resolve();
  },

  getProfile: () => {
    return api.get('/auth/profile');
  },

  updateProfile: (userData: {
    fullName?: string;
    phoneNumber?: string;
    photoURL?: string;
    gender?: string;
  }) => {
    return api.put<{
      success: boolean;
      message: string;
      data: {
        user: UserResponse;
      };
    }>('/auth/profile', userData);
  },

  updateUser: (userId: string, userData: {
    fullName?: string;
    phoneNumber?: string;
    photoUrl?: string;
    email?: string;
  }) => {
    return api.put(`/users/${userId}`, userData);
  },

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return api.put('/auth/change-password', data);
  },

  forgotPassword: (data: ForgotPasswordRequest) => {
    return api.post('/auth/forgot-password', data);
  },

  resetPassword: (data: ResetPasswordRequest) => {
    return api.post('/auth/reset-password', data);
  },

  checkOtp: (verifyCode: string) => {
    return api.post<{ success: boolean; message: string }>('/auth/check-otp', { verifyCode });
  },

  sendOtp: (email: string, userName: string) => {
    return api.post<{ success: boolean; message: string }>('/auth/send-new-verify-email', { email, userName });
  },
};

// Export the configured instance as default