import axios from 'axios';
import { URI_API } from './api';

const axiosInstance = axios.create({
  baseURL: URI_API,
});

// Add a request interceptor to include the Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    const isAuthRequest = originalRequest.url && (originalRequest.url.includes('/api/auth/login') || originalRequest.url.includes('/api/auth/refresh-token'));
    
    if (error.response && error.response.status === 401 && !isAuthRequest && !originalRequest._retry) {
      const isMultipleSession = error.response.data?.code === 'SESSION_EXPIRED';
      
      if (isMultipleSession) {
        // Tài khoản đang đăng nhập ở nơi khác - Cưỡng chế đăng xuất
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login?reason=session_expired';
        return Promise.reject(error);
      }

      // Nếu là lỗi token hết hạn (không phải do đăng nhập nơi khác), thử refresh
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Dùng axios thuần để tránh interceptor này lặp vô tận
          const response = await axios.post(`${URI_API}/api/auth/refresh-token`, { refreshToken });
          
          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Cập nhật header và thực hiện lại request cũ
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token cũng hết hạn hoặc bị thu hồi (đăng nhập nơi khác)
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;