import axios from '../config/axios';

const topicService = {
    // Get all topics
    getAllTopics: async () => {
        try {
            const response = await axios.get('/api/topics');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get topic by ID
    getTopicById: async (id) => {
        try {
            const response = await axios.get(`/api/topics/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create new topic
    createTopic: async (topicData) => {
        try {
            const response = await axios.post('/api/topics', topicData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update topic
    updateTopic: async (id, topicData) => {
        try {
            const response = await axios.put(`/api/topics/${id}`, topicData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete topic
    deleteTopic: async (id) => {
        try {
            const response = await axios.delete(`/api/topics/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default topicService;
