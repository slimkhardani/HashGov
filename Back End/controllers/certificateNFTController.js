const { MongoClient, ObjectId } = require('mongodb');
const {
  createAndMintNFT,
  getPrivateKeyFromAccountId,
} = require('./Mongo_SCNFT_Certif');
const dotenv = require('dotenv');
dotenv.config();

// MongoDB configuration
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'hedera';
const walletsCollection = 'wallets';
const nftsCollection = 'nfts';
const certificateDemandsCollection = 'certificatdemands';

// Admin/Operator wallet credentials for Hedera
const ADMIN_ACCOUNT_ID = process.env.ADMIN_ACCOUNT_ID;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

/**
 * Mint an NFT for an approved academic certificate
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */

const mintAcademicCertificateNFT = async (req, res) => {
  // Log headers for authentication debugging
  console.log('--- Incoming Headers ---');
  console.log(req.headers);

  const mongoClient = new MongoClient(mongoUri);

  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);

    // Extract data from request
    const {
      userId,
      certificateData,
      categoryType = 'Academic',
      itemType = 'Certificate',
    } = req.body;

    console.log('--- MintAcademicCertificateNFT Request ---');
    console.log('Request body:', req.body);
    // Log token if present
    if (req.headers && req.headers.authorization) {
      console.log('Authorization header:', req.headers.authorization);
    } else {
      console.log('No Authorization header present');
    }

    // Validate required fields
    if (!userId || !certificateData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId or certificateData',
      });
    }

    // Verify admin credentials exist
    if (!ADMIN_ACCOUNT_ID || !ADMIN_PRIVATE_KEY) {
      return res.status(500).json({
        success: false,
        message:
          'Admin credentials not properly configured in environment variables',
      });
    }

    // Find the certificate demand in database to update status
    console.log('Looking for certificate demand with:', {
      _id: certificateData._id,
      userId: userId,
    });
    let certificateDemand = null;
    try {
      // Convert userId string to ObjectId for correct matching
      let queryUserId;
      try {
        queryUserId = new ObjectId(userId);
      } catch (e) {
        console.error('Invalid userId format:', userId);
        return res
          .status(400)
          .json({ success: false, message: 'Invalid userId format' });
      }
      certificateDemand = await db
        .collection(certificateDemandsCollection)
        .findOne({
          _id: new ObjectId(certificateData._id),
          userId: queryUserId,
        });
      console.log('Certificate demand lookup result:', certificateDemand);
    } catch (dbErr) {
      console.error('Error during certificate demand lookup:', dbErr);
    }
    if (!certificateDemand) {
      console.error(
        'Certificate demand not found for _id:',
        certificateData._id,
        'and userId:',
        userId,
      );
      return res.status(404).json({
        success: false,
        message: 'Certificate demand not found',
      });
    }

    // Prepare metadata for NFT - using specific fields as requested
    const metadata = {
      UserAccountId: ADMIN_ACCOUNT_ID, // Using operator wallet as source
      InstitutionAccountId: ADMIN_ACCOUNT_ID, // Using operator wallet as destination
      receipentName: certificateData.recipient || 'Unknown',
      idNumber: certificateData.idNumber || 'Unknown',
      certificateTitle:
        certificateData.certificateTitle || 'Academic Certificate',
      institutionName: certificateData.institutionName || 'Unknown Institution',
      dateIssued:
        certificateData.dateIssued || new Date().toISOString().split('T')[0],
      grade: certificateData.grade || 'N/A',
      speciality: certificateData.speciality || 'N/A',
      duration: certificateData.duration || 'N/A',
      issuerName: certificateData.issuerName || 'Admin',
      userId: userId, // Include userId for reference
    };

    console.log('Creating NFT with metadata:', metadata);

    // Call the NFT minting function with optimized fee settings
    const mockReq = {
      body: {
        metadata,
        categoryType,
        itemType,
        optimizeFees: true, // Always minimize fees
        // Flag to skip MongoDB storage in createAndMintNFT function
        skipMongoDBStorage: true,
      },
    };

    // Create mock response object
    const nftResponse = await new Promise((resolve, reject) => {
      const mockRes = {
        status: (statusCode) => ({
          json: (data) => {
            data.statusCode = statusCode;
            if (statusCode >= 400) {
              reject(new Error(data.message || 'Failed to create NFT'));
            } else {
              resolve(data);
            }
            return mockRes;
          },
        }),
      };

      // Call the createAndMintNFT function with our mock objects
      createAndMintNFT(mockReq, mockRes).catch(reject);
    });

    // Check if the response was successful
    if (!nftResponse.success) {
      throw new Error(nftResponse.message || 'Failed to create NFT');
    }

    // Create a single, flattened NFT document with all necessary fields
    const nftDocument = {
      // Core NFT fields
      tokenId: nftResponse.data.tokenId,
      serialNumber: nftResponse.data.nftInfo.serialNumber,
      currentOwner: ADMIN_ACCOUNT_ID,

      // User identification
      userId: userId,
      userAccountId: metadata.UserAccountId,
      institutionAccountId: metadata.InstitutionAccountId,

      // Certificate details (flattened)
      certificateId: certificateData._id || null,
      certificateTitle: metadata.certificateTitle,
      recipientName: metadata.receipentName,
      idNumber: metadata.idNumber,
      institutionName: metadata.institutionName,
      dateIssued: metadata.dateIssued,
      grade: metadata.grade,
      speciality: metadata.speciality,
      duration: metadata.duration,
      issuerName: metadata.issuerName,

      // Classification
      categoryType: categoryType,
      itemType: itemType,

      // Status and timestamps
      status: 'minted',
      createdAt: new Date(),
      mintedAt: new Date(),
    };

    // Store a single, complete document in the nfts collection
    const nftResult = await db
      .collection(nftsCollection)
      .insertOne(nftDocument);
    console.log(
      'NFT data stored in nfts collection with ID:',
      nftResult.insertedId,
    );

    // Update the certificate demand status to approved with NFT info
    await db.collection(certificateDemandsCollection).updateOne(
      { _id: new ObjectId(certificateData._id) },
      {
        $set: {
          status: 'approved',
          nftData: {
            tokenId: nftResponse.data.tokenId,
            contractId: nftResponse.data.contractId,
            serialNumber: nftResponse.data.nftInfo.serialNumber,
            mintedAt: new Date(),
          },
        },
      },
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Academic certificate NFT created successfully',
      data: {
        nft: nftResponse.data,
        certificateId: certificateData._id,
        nftId: nftResult.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error('Error minting academic certificate NFT:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mint academic certificate NFT',
      error: error.message,
    });
  } finally {
    await mongoClient.close();
  }
};

/**
 * Verify if a certificate exists by its ObjectId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const verifyCertificate = async (req, res) => {
  const mongoClient = new MongoClient(mongoUri);

  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);

    // Extract the NFT ID from request parameters
    const { nftId } = req.params;

    if (!nftId || nftId.trim().length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid NFT ID format. Must be a 24-character ObjectId.',
      });
    }

    console.log('Verifying certificate with NFT ID:', nftId);

    // Try to convert the ID string to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(nftId.trim());
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid NFT ID format. Must be a valid ObjectId.',
      });
    }

    // First, check the nfts collection
    let nft = await db.collection(nftsCollection).findOne({ _id: objectId });

    // If not found there, try looking up by _id directly
    if (!nft) {
      nft = await db.collection(nftsCollection).findOne({ _id: nftId });
    }

    // If still not found, check certificatedemands collection
    if (!nft) {
      const certificateDemand = await db
        .collection(certificateDemandsCollection)
        .findOne({ _id: objectId });
      if (certificateDemand) {
        return res.status(200).json({
          success: true,
          message: 'Certificate found but not yet minted as NFT',
          nft: certificateDemand,
        });
      }
    }

    if (!nft) {
      return res.status(404).json({
        success: false,
        message: 'Certificate with the given ID not found',
      });
    }

    // Return the found NFT data
    return res.status(200).json({
      success: true,
      message: 'Certificate NFT found',
      nft,
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message,
    });
  } finally {
    await mongoClient.close();
  }
};

module.exports = {
  mintAcademicCertificateNFT,
  verifyCertificate,
};
