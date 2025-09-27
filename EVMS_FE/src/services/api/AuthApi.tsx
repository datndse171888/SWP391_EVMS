import { api } from "../../utils/Axios";

// Auth API methods
export const authApi = {
  login: (credentials: { email: string; password: string }) => {
    return api.post('/auth/login', credentials);
  },

  register: (userData: { email: string; password: string; name: string }) => {
    return api.post('/auth/register', userData);
  },

  logout: () => {
    return api.post('/auth/logout');
  },

  refreshToken: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post('/auth/refresh', { refreshToken });
  },

  forgotPassword: (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: (token: string, password: string) => {
    return api.post('/auth/reset-password', { token, password });
  },
};

// Export the configured instance as default