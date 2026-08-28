import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/v1/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/api/v1/auth/register', { email, password, name }),
  me: () => api.get('/api/v1/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/api/v1/auth/forgot-password', { email }),
  verifyOTP: (email: string, otp: string) =>
    api.post('/api/v1/auth/verify-otp', { email, otp }),
  resetPassword: (email: string, otp: string, password: string, confirmPassword: string) =>
    api.post('/api/v1/auth/reset-password', { email, otp, password, confirm_password: confirmPassword }),
  logout: () => api.post('/api/v1/auth/logout'),
};

export const statsAPI = {
  getOverview: () => api.get('/api/v1/admin/stats'),
};

export const ridesAPI = {
  getActive: () => api.get('/api/v1/admin/rides?status=active'),
  getHistory: () => api.get('/api/v1/admin/rides?status=completed'),
};

export const usersAPI = {
  getAll: () => api.get('/api/v1/admin/users'),
};
