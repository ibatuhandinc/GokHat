import axios from 'axios';

/**
 * Merkezi Axios istemcisi.
 *
 * - Base URL: Vite proxy sayesinde /api → http://localhost:3000/api
 * - Her istekte localStorage'daki token otomatik eklenir
 * - 401 yanıtında oturumu temizler ve /login'e yönlendirir
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request interceptor: Bearer token ekle ── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor: 401 → logout ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Sayfayı login'e yönlendir (React Router dışından)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
