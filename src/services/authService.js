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
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const getProfile = async () => {
    try {
        // Backend dùng ID từ token decode qua middleware
        const response = await axios.get('/api/auth/profile');
        const resData = response.data;
        
        // Tự động bóc tách dữ liệu: Ưu tiên resData.data, sau đó đến resData.user, cuối cùng là chính nó
        if (resData.success && resData.data) {
            // Trường hợp backend trả về { success: true, data: { username, ... } }
            return resData.data;
        }
        if (resData.user) {
            // Trường hợp backend trả về { user: { username, ... } }
            return resData.user;
        }
        if (resData.data && resData.data.user) {
             // Trường hợp backend lồng sâu: { data: { user: { ... } } }
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
