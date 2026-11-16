import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tb_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for recruiter portal routes if 401, not for public home or candidate actions
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && window.location.pathname !== '/') {
      localStorage.removeItem('tb_token');
      localStorage.removeItem('tb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
