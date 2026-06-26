import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust this to your backend URL

// Helper function to get auth token from cookies
const getToken = () => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === 'token') {
      return cookieValue;
    }
  }
  return null;
};

// Configure axios with auth token
const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const createWallet = async () => {
  try {
    // Using the endpoint that works in Postman
    const response = await axios.post(`${API_URL}/identity/wallet`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};

// Get wallet balance
const getWalletBalance = async (accountId) => {
  try {
    const response = await axios.get(`${API_URL}/wallet/balance/${accountId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw error;
  }
};

// Get wallet transactions 
const getWalletTransactions = async (accountId) => {
  try {
    const response = await axios.get(`${API_URL}/wallet/transactions/${accountId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    throw error;
  }
};

export {
  createWallet,
  getWalletBalance,
  getWalletTransactions
};
