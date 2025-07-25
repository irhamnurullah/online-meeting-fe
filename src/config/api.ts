import axios from 'axios';

// Buat instance axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Tambahkan loading state jika diperlukan
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url);

    // Ambil token dari localStorage atau state management
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Tambahkan timestamp untuk cache busting
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('❌ Response Error:', error.response?.status, error.config?.url);

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Coba refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry request dengan token baru
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
      }

      // Jika refresh gagal, redirect ke login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('❌ Access forbidden - insufficient permissions');
      // Bisa tambahkan toast notification di sini
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('❌ Server error occurred');
      // Bisa tambahkan retry logic atau fallback di sini
    }

    // Handle Network Error
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('❌ Network connection failed');
      // Bisa tambahkan offline handling di sini
    }

    return Promise.reject(error);
  }
);

export default api;
