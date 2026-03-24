import axios from '../config/axios';

const feedbackService = {
  getAllFeedbacks: async (params = {}) => {
    try {
      const response = await axios.get('/api/feedbacks', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      throw error;
    }
  },

  deleteFeedback: async (id) => {
    try {
      const response = await axios.delete(`/api/feedbacks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }
};

export default feedbackService;
