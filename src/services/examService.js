import axios from '../config/axios';

const examService = {
    // Get all exams with filters
    getAllExams: async (params = {}) => {
        try {
            const response = await axios.get('/api/exams', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get exam by ID
    getExamById: async (id) => {
        try {
            const response = await axios.get(`/api/exams/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create new exam
    createExam: async (examData) => {
        try {
            const response = await axios.post('/api/exams', examData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update exam
    updateExam: async (id, examData) => {
        try {
            const response = await axios.put(`/api/exams/${id}`, examData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete exam
    deleteExam: async (id) => {
        try {
            const response = await axios.delete(`/api/exams/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default examService;

