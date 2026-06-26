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

/**
 * Update wallet with NFT token information
 */
const updateWalletWithNft = async (data) => {
  try {
    const { userId, accountId, tokenId, mintedSerials } = data;
    const response = await axios.post(`${API_URL}/wallet/update-nft`, {
      userId,
      accountId,
      tokenId,
      mintedSerials
    }, getAuthHeaders());
    
    return response.data;
  } catch (error) {
    console.error('Error updating wallet with NFT:', error);
    throw error;
  }
};

/**
 * Get all NFTs associated with a wallet
 */
const getWalletNfts = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/wallet/nfts/${userId}`, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error getting wallet NFTs:', error);
    throw error;
  }
};

export {
  updateWalletWithNft,
  getWalletNfts
};
