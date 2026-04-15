import axios from '../config/axios';

const wordService = {
    // Get all words
    getAllWords: async (params = {}) => {
        try {
            const response = await axios.get('/api/words', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get word by ID
    getWordById: async (id) => {
        try {
            const response = await axios.get(`/api/words/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create new word
    createWord: async (wordData) => {
        try {
            const response = await axios.post('/api/words', wordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update word
    updateWord: async (id, wordData) => {
        try {
            const response = await axios.put(`/api/words/${id}`, wordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete word
    deleteWord: async (id) => {
        try {
            const response = await axios.delete(`/api/words/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default wordService;
