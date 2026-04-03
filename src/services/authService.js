import axios from '../config/axios';
import { URI_API } from "../config/api";

export const login = async (emailOrUsername, password) => {
    try {
        const res = await axios.post('/api/auth/login', { emailOrUsername, password });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error("No refresh token");

    try {
        const res = await axios.post('/api/auth/refresh-token', { refreshToken });
        if (res.data.success) {
            localStorage.setItem('token', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            return res.data.accessToken;
        }
    } catch (error) {
        logout();
        throw error;
    }
};

export const getProfile = async () => {
    try {
        const response = await axios.get('/api/auth/profile');
        const resData = response.data;
        if (resData.success && resData.data) {
            return resData.data;
        }
        if (resData.user) {
            return resData.user;
        }
        if (resData.data && resData.data.user) {
            return resData.data.user;
        }
        
        return resData;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Lấy thông tin profile thất bại");
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await axios.put('/api/auth/profile', userData);
        if (response.data && response.data.success) {
            return response.data;
        }
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Cập nhật profile thất bại");
    }
};
