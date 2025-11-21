import axios from 'axios';
import Cookies from 'js-cookie'; // Install: npm i js-cookie @types/js-cookie

const api = axios.create({
  baseURL: 'http://192.168.1.15:3001/api', // Sesuai dokumentasi
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tambahkan Token ke setiap request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Handle 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user_role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;