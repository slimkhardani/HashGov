import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const createIdentityNFT = async (identityData, token) => {
  try {
    // Ensure token has the Bearer prefix
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: formattedToken,
      },
    };
    
    // Log the request for debugging
    console.log(`Sending request to ${API_URL}/nft/create-and-mint with token format: ${formattedToken.substring(0, 15)}...`);

    const response = await axios.post(
      `${API_URL}/nft/create-and-mint`,
      identityData,
      config
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating NFT:', error);
    throw error;
  }
};

const getNFTDetails = async (tokenId, token) => {
  try {
    // Ensure token has the Bearer prefix
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    const config = {
      headers: {
        Authorization: formattedToken,
      },
    };

    const response = await axios.get(
      `${API_URL}/identity/nft/${tokenId}`,
      config
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    throw error;
  }
};

/**
 * Mint an NFT for an approved academic certificate
 * @param {Object} certificateData - The academic certificate data
 * @param {string} userId - The user ID associated with the certificate
 * @returns {Promise} - The API response with NFT data
 */
const mintAcademicCertificateNFT = async (certificateData, userId) => {
  try {
    // Get token from cookie or localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1] || localStorage.getItem('token');
    
    // Ensure token has the Bearer prefix
    const formattedToken = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
    
    console.log('[NFTService] Using token:', formattedToken ? formattedToken.substring(0, 20) + '...' : 'No token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: formattedToken
      },
      withCredentials: true
    };
    
    // Ensure the certificate data is properly formatted
    const academicInfo = certificateData.academicInfo || certificateData;
    
    // Prepare the payload with only the necessary data
    const payload = {
      userId,
      certificateData: {
        _id: certificateData._id,
        recipient: academicInfo.recipient,
        idNumber: academicInfo.idNumber,
        certificateTitle: academicInfo.certificateTitle,
        institutionName: academicInfo.institutionName,
        dateIssued: academicInfo.dateIssued,
        grade: academicInfo.grade,
        speciality: academicInfo.speciality,
        duration: academicInfo.duration,
        issuerName: academicInfo.issuerName
      },
      categoryType: 'Academic',
      itemType: 'Certificate'
    };
    
    console.log('Minting academic certificate NFT with payload:', payload);
    // Log the endpoint
    console.log('[NFTService] Sending POST to:', `${API_URL}/admin/certificatdemands/mint-nft`);
    
    let response;
    try {
      response = await axios.post(
        `${API_URL}/admin/certificatdemands/mint-nft`,
        payload,
        config
      );
      console.log('[NFTService] Backend response:', response.data);
    } catch (apiErr) {
      if (apiErr.response) {
        console.error('[NFTService] Backend error response:', apiErr.response.data);
      } else {
        console.error('[NFTService] API call failed:', apiErr.message);
      }
      throw apiErr;
    }
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mint NFT');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error minting academic certificate NFT:', error);
    // Return a standardized error format
    throw error.response?.data?.message || error.message || 'Failed to connect to NFT minting service';
  }
};

/**
 * Mint an NFT for an approved property-related certificate
 * @param {Object} certificateData - The property certificate data
 * @param {string} userId - The user ID associated with the certificate
 * @returns {Promise} - The API response with NFT data
 */
const mintPropertyCertificateNFT = async (certificateData, userId) => {
  try {
    // Get token from cookie or localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1] || localStorage.getItem('token');
    
    // Ensure token has the Bearer prefix
    const formattedToken = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
    
    console.log('[NFTService] Using token:', formattedToken ? formattedToken.substring(0, 20) + '...' : 'No token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: formattedToken
      },
      withCredentials: true
    };
    
    // The complete certificate data is needed for property NFTs
    // We can't simplify it as much as academic certificates because
    // we need different fields based on property type
    
    console.log('Minting property certificate NFT with certificate ID:', certificateData._id);
    console.log('[NFTService] Sending POST to:', `${API_URL}/nft/property-certificate/create`);
    
    let response;
    try {
      response = await axios.post(
        `${API_URL}/nft/property-certificate/create`,
        certificateData, // Pass the entire certificate data
        config
      );
      console.log('[NFTService] Backend response:', response.data);
    } catch (apiErr) {
      if (apiErr.response) {
        console.error('[NFTService] Backend error response:', apiErr.response.data);
      } else {
        console.error('[NFTService] API call failed:', apiErr.message);
      }
      throw apiErr;
    }
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mint property NFT');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error minting property certificate NFT:', error);
    // Return a standardized error format
    throw error.response?.data?.message || error.message || 'Failed to connect to NFT minting service';
  }
};

export const nftService = {
  createIdentityNFT,
  getNFTDetails,
  mintAcademicCertificateNFT,
  mintPropertyCertificateNFT
};
