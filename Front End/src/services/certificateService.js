import axios from 'axios';

// Base URL for backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token from localStorage or cookies
const getToken = () => {
  return localStorage.getItem('token') || getCookie('token');
};

// Helper function to get cookie
const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

// Create a new certificate demand
export const createCertificateDemand = async (certificateData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/certificate-demands/create`, 
      certificateData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating certificate demand:', error);
    if (error.response) {
      // The request was made and the server responded with an error status code
      throw error.response.data || { message: 'Failed to create certificate demand' };
    } else if (error.request) {
      // The request was made but no response was received
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      // Something happened in setting up the request
      throw { message: error.message || 'Failed to create certificate demand' };
    }
  }
};

// Get all certificate demands for the current user
export const getUserCertificateDemands = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/certificate-demands/user`,
      {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate demands:', error);
    if (error.response) {
      // The request was made and the server responded with an error status code
      throw error.response.data || { message: 'Failed to fetch certificate demands' };
    } else if (error.request) {
      // The request was made but no response was received
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      // Something happened in setting up the request
      throw { message: error.message || 'Failed to fetch certificate demands' };
    }
  }
};
