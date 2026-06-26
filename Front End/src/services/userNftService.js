import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all NFTs for the currently logged-in user
 * @returns {Promise} - The API response with user's NFTs
 */
const getUserNfts = async () => {
  try {
    // Get token from cookie or localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1] || localStorage.getItem('token');
    
    // Parse the token to get user ID - this assumes JWT format
    let userId = null;
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id || payload._id || payload.userId;
      }
    } catch (e) {
      console.warn('Could not parse user token', e);
    }
    
    // Ensure token has the Bearer prefix
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: formattedToken,
      },
    };
    
    // Log the request for debugging
    console.log(`[userNftService] Fetching all NFTs from ${API_URL}/nft/info`);

    // Use the existing endpoint that returns all NFTs
    const response = await axios.get(
      `${API_URL}/nft/info`,
      config
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch NFTs');
    }
    
    // Filter NFTs to only include ones that belong to the current user
    // This filtering happens client-side since we don't have a dedicated endpoint
    let userNfts = response.data.data;
    
    if (userId) {
      userNfts = userNfts.filter(nft => {
        // Check various places where userId might be stored
        return (
          // Direct userId match
          (nft.userId && nft.userId.toString() === userId.toString()) ||
          // In originalRequest
          (nft.originalRequest?.userId && nft.originalRequest.userId.toString() === userId.toString()) ||
          // In metadata
          (nft.metadata?.userId && nft.metadata.userId.toString() === userId.toString()) ||
          // Match by tokenId if the user owns the NFT
          (nft.nftInfo?.currentOwner === userId)
        );
      });
      
      console.log(`[userNftService] Filtered ${userNfts.length} NFTs for user ${userId}`);
    } else {
      console.warn('[userNftService] No userId found in token, showing all NFTs');
    }
    
    return { success: true, data: userNfts };
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    throw error.response?.data?.message || error.message || 'Failed to connect to NFT service';
  }
};

/**
 * Open the HashScan link for a token in a new tab
 * @param {string} tokenId - The Hedera token ID
 * @param {string} serialNumber - The NFT serial number
 */
const openHashScanLink = (tokenId, serialNumber) => {
  if (!tokenId || !serialNumber) {
    console.error('Missing tokenId or serialNumber for HashScan link');
    return;
  }
  
  const url = `https://hashscan.io/testnet/token/${tokenId}/${serialNumber}`;
  window.open(url, '_blank');
};

export const userNftService = {
  getUserNfts,
  openHashScanLink
};
