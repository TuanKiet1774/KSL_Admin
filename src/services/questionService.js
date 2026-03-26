import axios from '../config/axios';

const questionService = {
    // Get all questions with optional filters
    getAllQuestions: async (params = {}) => {
        try {
            const response = await axios.get('/api/questions', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get question by ID
    getQuestionById: async (id) => {
        try {
            const response = await axios.get(`/api/questions/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create new question
    createQuestion: async (questionData) => {
        try {
            const response = await axios.post('/api/questions', questionData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update question
    updateQuestion: async (id, questionData) => {
        try {
            const response = await axios.put(`/api/questions/${id}`, questionData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete question
    deleteQuestion: async (id) => {
        try {
            const response = await axios.delete(`/api/questions/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default questionService;
