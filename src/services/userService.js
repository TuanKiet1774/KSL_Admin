import axios from '../config/axios';

const userService = {
    // Get all users
    getAllUsers: async () => {
        try {
            const response = await axios.get('/api/users');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get user by ID
    getUserById: async (id) => {
        try {
            const response = await axios.get(`/api/users/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Add new user
    createUser: async (userData) => {
        try {
            const response = await axios.post('/api/users', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update user
    updateUser: async (id, userData) => {
        try {
            const response = await axios.put(`/api/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete user
    deleteUser: async (id) => {
        try {
            const response = await axios.delete(`/api/users/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default userService;
