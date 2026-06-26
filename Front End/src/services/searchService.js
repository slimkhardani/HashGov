import axios from 'axios';

// Base API URL - make sure to update this to match your environment
const API_URL = 'http://localhost:5000/api';

/**
 * Service for handling global search across identity, wallet, and certificates
 */
const searchService = {
  /**
   * Perform a global search across all services
   * @param {string} query - The search query
   * @returns {Promise} - Promise with search results
   */
  globalSearch: async (query) => {
    try {
      const response = await axios.get(`${API_URL}/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search service error:', error);
      throw error;
    }
  }
};

export default searchService;
