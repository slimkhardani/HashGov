import axios from 'axios';

// Base URL for backend API
const API_BASE_URL = 'http://localhost:5000/api';

export const updateRequestService = {
  /**
   * Create a new profile update request
   * @param {Object} requestData - Contains email, message and timestamp
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} - Response from server
   */
  createUpdateRequest: async (requestData, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/update-requests/create`, 
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating update request:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.message || 'Failed to submit update request');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error setting up request: ' + error.message);
      }
    }
  }
};
