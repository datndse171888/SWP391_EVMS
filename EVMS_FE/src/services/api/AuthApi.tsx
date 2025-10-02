import type { AccountLogin } from "../../types/account/Account";
import type { AccountRegister } from "../../types/account/Account";
import { api } from "../../utils/Axios";

// Auth API methods
export const authApi = {
  login: (credentials: AccountLogin) => {
    return api.post('/auth/login', credentials);
  },

  loginWithGoogle: (data: { email: string; userName: string; photoURL?: string }) => {
    return api.post('/auth/google-login', data);
  },

  register: (userData: AccountRegister) => {
    return api.post('/auth/register', userData);
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
    return api.put('/auth/profile', userData);
  },

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return api.put('/auth/change-password', data);
  },

  forgotPassword: (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: (token: string, password: string) => {
    return api.post('/auth/reset-password', { token, password });
  },
};

// Export the configured instance as default