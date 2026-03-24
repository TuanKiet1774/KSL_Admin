import axios from '../config/axios';

const dashboardService = {
  getStatistics: async () => {
    try {
      const response = await axios.get('/api/stastic');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }
};

export default dashboardService;
