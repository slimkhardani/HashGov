const {
  AccountId,
  PrivateKey,
  Client,
  Hbar,
  ContractFunctionParameters,
  ContractCallQuery,
  ContractExecuteTransaction,
  AccountCreateTransaction,
  ContractCreateFlow,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction,
  TokenAssociateTransaction,
  TokenId,
  TokenMintTransaction,
} = require('@hashgraph/sdk'); // v2.46.0

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Configuration MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'hedera';
const userCollectionName = process.env.USER_COLLECTION || 'wallets';
const nftsCollectionName = process.env.NFTS_COLLECTION || 'nfts';

// Operator wallet (admin)
const OPERATOR_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const OPERATOR_ACCOUNT_ID = process.env.ADMIN_ACCOUNT_ID;

/**
 * Récupère la clé privée depuis MongoDB pour un ID de compte donné
 * @param {string} accountId - L'ID du compte Hedera (format: 0.0.XXXXX)
 * @returns {Promise<PrivateKey>} - La clé privée associée à l'ID du compte
 */
async function getPrivateKeyFromAccountId(accountId) {
  const mongoClient = new MongoClient(mongoUri);

  try {
    await mongoClient.connect();
    console.log(`Connexion MongoDB établie pour la recherche de: ${accountId}`);

    const db = mongoClient.db(dbName);
    const usersCollection = db.collection(userCollectionName);

    console.log(`Recherche de la clé privée pour le compte: ${accountId}`);
    const user = await usersCollection.findOne({ accountId: accountId });

    if (!user || !user.privateKey) {
      console.warn(
        `Clé privée introuvable pour l'accountId: ${accountId}, utilisation du fallback`,
      );
      // Fallback sur la clé de l'opérateur si la clé n'est pas trouvée
      const adminKey = process.env.ADMIN_PRIVATE_KEY;
      const cleanKey =
        adminKey.startsWith('0x') ? adminKey.substring(2) : adminKey;
      return PrivateKey.fromStringECDSA(cleanKey);
    }

    console.log(`Clé privée trouvée dans MongoDB pour ${accountId}`);
    // Vérifier si la clé privée a un préfixe 0x
    const userKey =
      user.privateKey.startsWith('0x') ?
        user.privateKey.substring(2)
      : user.privateKey;
    return PrivateKey.fromStringECDSA(userKey);
  } catch (error) {
    console.error(
      'Erreur lors de la récupération de la clé privée depuis MongoDB:',
      error,
    );
    // Fallback sur la clé de l'opérateur en cas d'erreur
    const adminKey = process.env.ADMIN_PRIVATE_KEY;
    const cleanKey =
      adminKey.startsWith('0x') ? adminKey.substring(2) : adminKey;
    return PrivateKey.fromStringECDSA(cleanKey);
  } finally {
    await mongoClient.close();
    console.log('Connexion MongoDB fermée');
  }
}

/**
 * Controller for creating and minting NFTs with different metadata based on category type
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
/**
 * Helper function to get the appropriate info field name based on item type
 * @param {string} itemType - The type of property item (car, motorcycle, realEstate)
 * @returns {string} - The field name for the item info object
 */
function getItemInfoFieldName(itemType) {
  switch (itemType.toLowerCase()) {
    case 'car':
      return 'carInfo';
    case 'motorcycle':
      return 'motorcycleInfo';
    case 'realestate':
    case 'real estate':
    case 'realEstate':
      return 'realEstateInfo';
    default:
      return 'carInfo'; // Default fallback
  }
}

/**
 * Prepare metadata for a property certificate NFT based on the item type
 * @param {Object} certificateData - The certificate data from the request
 * @returns {Object} - The prepared metadata object
 */
function preparePropertyNFTMetadata(certificateData) {
  const { type, itemType, buyerInfo, sellerInfo } = certificateData;
  const itemInfoFieldName = getItemInfoFieldName(itemType);
  const itemInfo = certificateData[itemInfoFieldName] || {};

  // Add debugging to see what we're working with
  console.log(
    'preparePropertyNFTMetadata received:',
    JSON.stringify(certificateData, null, 2),
  );

  // Base metadata for all property types
  const metadata = {
    type: type || 'property-related',
    itemType: itemType || 'car',
    // Use buyerInfo and sellerInfo as property names to match validation checks
    buyerInfo: {
      fullName: buyerInfo?.fullName,
      nationalId: buyerInfo?.nationalId,
      dateOfIdIssue: buyerInfo?.dateOfIdIssue,
    },
    sellerInfo: {
      fullName: sellerInfo?.fullName,
      nationalId: sellerInfo?.nationalId,
      dateOfIdIssue: sellerInfo?.dateOfIdIssue,
    },
    transactionDate: new Date().toISOString(),
  };

  // Add item-specific data based on type
  switch (itemType.toLowerCase()) {
    case 'car':
      // Map frontend fields to expected validation fields
      metadata.propertyDetails = {
        manufacturer: itemInfo.manufacturer,
        // Map modelType to model as expected by validation
        model: itemInfo.modelType || itemInfo.model,
        // Map dateOfFirstCirculation to yearOfManufacture or extract year
        yearOfManufacture:
          itemInfo.yearOfManufacture ||
          (itemInfo.dateOfFirstCirculation ?
            itemInfo.dateOfFirstCirculation.substring(0, 4)
          : ''),
        // Keep other fields
        serialNumber: itemInfo.serialNumber,
        registrationNumber: itemInfo.registrationNumber,
        purchasePrice: itemInfo.purchasePrice,
      };
      break;
    case 'motorcycle':
      metadata.propertyDetails = {
        manufacturer: itemInfo.manufacturer,
        model: itemInfo.model,
        yearOfManufacture: itemInfo.yearOfManufacture,
        type: itemInfo.type,
        purchasePrice: itemInfo.purchasePrice,
      };
      break;
    case 'realestate':
    case 'real estate':
    case 'realEstate':
      metadata.propertyDetails = {
        fullAddress: itemInfo.fullAddress,
        propertyType: itemInfo.propertyType,
        surfaceArea: itemInfo.surfaceArea,
        yearOfConstruction: itemInfo.yearOfConstruction,
        condition: itemInfo.condition,
        purchasePrice: itemInfo.purchasePrice,
      };
      break;
  }

  return metadata;
}

const createAndMintPropertyNFT = async (req, res) => {
  let client;
  let mongoClient;
  try {
    // Debug: log the incoming request body to diagnose frontend-backend issues
    console.log(
      '=== [DEBUG] Received body in createAndMintPropertyNFT:',
      JSON.stringify(req.body, null, 2),
    );

    // Get request data
    const certificateData = req.body;
    const type = certificateData.type || 'property-related';
    const itemType = certificateData.itemType || 'car'; // car, motorcycle, realEstate
    const optimizeFees = true; // Always minimize fees
    const platformFee = req.body.platformFee || 0; // Optional platform fee in HBAR

    // Use operator wallet for all actions
    if (!OPERATOR_PRIVATE_KEY || !OPERATOR_ACCOUNT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Operator wallet credentials missing in .env',
      });
    }
    // Debug logging for key/account issues
    console.log('Loaded OPERATOR_ACCOUNT_ID:', OPERATOR_ACCOUNT_ID);
    console.log('Loaded OPERATOR_PRIVATE_KEY:', OPERATOR_PRIVATE_KEY);
    console.log('Key length:', OPERATOR_PRIVATE_KEY.length);
    console.log('Key preview:', OPERATOR_PRIVATE_KEY.slice(0, 20));

    // Verify we have the required data
    if (!certificateData.buyerInfo || !certificateData.sellerInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing buyer or seller information',
      });
    }

    // Verify we have the appropriate info object based on itemType
    const itemInfoFieldName = getItemInfoFieldName(itemType);
    if (!certificateData[itemInfoFieldName]) {
      return res.status(400).json({
        success: false,
        message: `Missing ${itemInfoFieldName} data for ${itemType} certificate`,
      });
    }
    // Parse the private key using fromString so it can accept DER, hex, or mnemonic
    const operatorPrivateKey = PrivateKey.fromString(OPERATOR_PRIVATE_KEY);
    // Log the derived public key for further debugging
    console.log('Derived Public Key:', operatorPrivateKey.publicKey.toString());
    client = Client.forTestnet().setOperator(
      OPERATOR_ACCOUNT_ID,
      operatorPrivateKey,
    );
    // Set minimal transaction fees globally if possible
    client.setDefaultMaxTransactionFee(new Hbar(1)); // 1 HBAR (adjust lower if possible)
    client.setMaxQueryPayment(new Hbar(1)); // 1 HBAR (adjust lower if possible)

    // --- Test the operator key/account with AccountBalanceQuery ---
    try {
      const { AccountBalanceQuery } = require('@hashgraph/sdk');
      const balance = await new AccountBalanceQuery()
        .setAccountId(OPERATOR_ACCOUNT_ID)
        .execute(client);
      console.log('[Hedera Test] Account balance:', balance.hbars.toString());
    } catch (err) {
      console.error('[Hedera Test] AccountBalanceQuery failed:', err);
    }

    // Prepare MongoDB connection for later
    mongoClient = new MongoClient(mongoUri);
    const metadata = preparePropertyNFTMetadata(certificateData);
    if (!metadata) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: metadata',
      });
    }

    console.log(`Using type: ${type}, itemType: ${itemType}`);

    // Validate the required metadata fields for property certificate
    if (!metadata.buyerInfo || !metadata.sellerInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required metadata fields: buyerInfo or sellerInfo',
      });
    }

    // Validate category-specific metadata
    // Validate property-specific metadata based on itemType
    if (type === 'property-related') {
      // Check that we have property details
      if (!metadata.propertyDetails) {
        return res.status(400).json({
          success: false,
          message: 'Missing required property details in metadata',
        });
      }

      // Specific validation based on itemType
      switch (itemType.toLowerCase()) {
        case 'car':
          if (
            !metadata.propertyDetails.manufacturer ||
            !metadata.propertyDetails.model ||
            !metadata.propertyDetails.yearOfManufacture
          ) {
            return res.status(400).json({
              success: false,
              message:
                'Missing required car metadata fields: manufacturer, model, yearOfManufacture',
            });
          }
          break;
        case 'motorcycle':
          // Only check for manufacturer and model, allow yearOfManufacture to be empty
          if (
            !metadata.propertyDetails.manufacturer ||
            !metadata.propertyDetails.model
          ) {
            return res.status(400).json({
              success: false,
              message:
                'Missing required motorcycle metadata fields: manufacturer, model',
            });
          }
          // If yearOfManufacture is empty, it's OK - just log a warning
          if (!metadata.propertyDetails.yearOfManufacture) {
            console.log(
              'Warning: yearOfManufacture is empty for motorcycle NFT',
            );
          }
          break;
        case 'realestate':
        case 'real estate':
        case 'realEstate':
          if (
            !metadata.propertyDetails.fullAddress ||
            !metadata.propertyDetails.propertyType ||
            !metadata.propertyDetails.surfaceArea
          ) {
            return res.status(400).json({
              success: false,
              message:
                'Missing required real estate metadata fields: fullAddress, propertyType, surfaceArea',
            });
          }
          break;
        default:
          return res.status(400).json({
            success: false,
            message: `Unknown property type: ${itemType}`,
          });
      }
    } else {
      // Pour d'autres catégories, nous les autorisons mais avec un avertissement
      console.log(
        `AVERTISSEMENT: Catégorie non standard utilisée: ${type} / ${itemType}`,
      );
    }

    // Get the operator account ID from environment or use a default
    const operatorAccountId =
      process.env.MY_ACCOUNT_ID ||
      process.env.OPERATOR_ACCOUNT_ID ||
      '0.0.5904951';
    console.log(`Using Hedera Operator ID: ${operatorAccountId}`);

    const MY_ACCOUNT_ID = AccountId.fromString(operatorAccountId);

    // Load NFT token ID and supply/admin key from environment variables
    const NFT_TOKEN_ID = process.env.NFT_TOKEN_ID;
    const NFT_SUPPLY_KEY = process.env.NFT_SUPPLY_KEY;

    // Get the private key from environment or use a default
    const operatorKey =
      process.env.MY_PRIVATE_KEY ||
      process.env.OPERATOR_PRIVATE_KEY ||
      process.env.OPERATOR_ACCOUNT_PRIVATE_KEY ||
      '0x302e020100300506032b657004220420c9e23f4fc1e40ed49c02d04360f4af0afc6fbb1b88c6cbb11ef10a6f4ef7eb90';

    // Handle different key formats (with or without 0x prefix)
    const cleanKey =
      operatorKey.startsWith('0x') ? operatorKey.substring(2) : operatorKey;
    console.log(`Using operator key: ${cleanKey.substring(0, 10)}...`);

    try {
      // Use fromString first, which handles multiple formats
      const MY_PRIVATE_KEY = PrivateKey.fromString(cleanKey);

      // For development, use testnet
      client = Client.forTestnet();
      console.log('Created Hedera testnet client');

      // Set the operator account and key
      client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

      // Set consistent fee limits
      if (optimizeFees) {
        console.log('Optimizing fees for NFT minting');
        client.setMaxTransactionFee(new Hbar(5)); // Max 5 HBAR per transaction
        client.setMaxQueryPayment(new Hbar(0.5)); // Max 0.5 HBAR per query
      } else {
        client.setMaxTransactionFee(new Hbar(20)); // Reasonable default
        client.setMaxQueryPayment(new Hbar(1)); // Reasonable default
      }
    } catch (error) {
      console.error('Error configuring Hedera client:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to configure Hedera client',
        error: error.message,
      });
    }

    // Function to generate metadata JSON string
    const generateMetadata = (categoryType, itemType, metadataFields) => {
      let metadataObj = {
        categoryType,
        itemType,
        UserAccountId: metadataFields.UserAccountId,
        InstitutionAccountId: metadataFields.InstitutionAccountId,
      };

      // Add specific fields based on category and item type
      if (categoryType === 'Academic' && itemType === 'Certificate') {
        metadataObj = {
          ...metadataObj,
          studentName: metadataFields.studentName,
          certificateTitle: metadataFields.certificateTitle,
          institutionName: metadataFields.institutionName,
          dateIssued: metadataFields.dateIssued,
          grade: metadataFields.grade,
          speciality: metadataFields.speciality,
          duration: metadataFields.duration,
          issuerName: metadataFields.issuerName,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Si d'autres catégories sont passées, nous intégrons tous les champs disponibles
        metadataObj = {
          ...metadataObj,
          ...metadataFields,
          timestamp: new Date().toISOString(),
        };
      }

      return JSON.stringify(metadataObj, null, 2);
    };

    // Generate metadata JSON string
    // Use 'type' instead of undefined 'categoryType'
    const metadataStr = generateMetadata(type, itemType, metadata);
    console.log('Generated metadata:', metadataStr);

    // Mint NFT using the global NFT token and supply/admin key
    const simplifiedMetadata = `Certificate: ${metadata.certificateTitle} - ${metadata.studentName}`;
    console.log('Using simplified metadata for minting:', simplifiedMetadata);

    const tokenIdObj = TokenId.fromString(NFT_TOKEN_ID);
    const supplyKey = PrivateKey.fromString(NFT_SUPPLY_KEY);

    // Create Hedera client
    client = Client.forTestnet();
    client.setOperator(OPERATOR_ACCOUNT_ID, OPERATOR_PRIVATE_KEY);

    // Mint the NFT
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenIdObj)
      .setMetadata([Buffer.from(simplifiedMetadata)])
      .freezeWith(client)
      .sign(supplyKey);
    const mintSubmit = await mintTx.execute(client);
    const mintRx = await mintSubmit.getReceipt(client);
    const serial = mintRx.serials[0];
    console.log(`Minted NFT with serial: ${serial} \n`);

    // IMPORTANT: For property certificates, we'll use the operator account for all operations
    // Log the buyer and seller information for reference
    console.log(`Metadata - Buyer Info: ${JSON.stringify(metadata.buyerInfo)}`);
    console.log(
      `Metadata - Seller Info: ${JSON.stringify(metadata.sellerInfo)}`,
    );

    // For property certificates, we use the operator account for all operations
    // This simplifies the process while still maintaining the integrity of the NFT
    console.log('Using operator account for property certificate NFT');

    // We'll use the operator's private key for all operations
    const propertyNftPrivateKey = OPERATOR_PRIVATE_KEY; // Use OPERATOR_PRIVATE_KEY instead of undefined MY_PRIVATE_KEY

    // For property certificates, we only need the operator account
    console.log(
      'Property certificates use the operator account for transactions',
    );

    // No need to retrieve institution private key for property certificates
    // All operations will be done using the operator account

    // Use the existing tokenIdObj from the NFT minting section
    console.log(`Token ID for association: ${tokenIdObj.toString()}`);

    // For property certificates, we only associate the token with the operator account
    try {
      // Associate the token with the operator account
      const associateOperatorToken = await new TokenAssociateTransaction()
        .setAccountId(MY_ACCOUNT_ID)
        .setTokenIds([tokenIdObj])
        .setMaxTransactionFee(new Hbar(50)) // Set max fee for this transaction
        .execute(client);

      const associateReceipt = await associateOperatorToken.getReceipt(client);
      console.log(
        `Token associated with operator account successfully: ${associateReceipt.status} \n`,
      );
    } catch (error) {
      // Check if the error is due to an existing association
      if (error.message.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
        console.log('Token is already associated with the operator account \n');
      } else {
        console.error('Error associating token:', error.message);
        // Continue execution even in case of error
      }
    }

    // Check that serial is defined before preparing response
    if (!serial) {
      return res.status(500).json({
        success: false,
        message: 'Failed to mint NFT: serial number not returned',
        error: 'serial is undefined or null',
      });
    }
    // Prepare metadata for NFT based on property type
    const nftMetadata = preparePropertyNFTMetadata(certificateData);

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Property Certificate NFT created successfully',
      data: {
        tokenId: tokenIdObj.toString(),
        nftInfo: {
          serialNumber: serial.toString(),
          currentOwner: OPERATOR_ACCOUNT_ID,
        },
        type: certificateData.type || 'property-related',
        itemType: certificateData.itemType,
        buyerInfo: certificateData.buyerInfo,
        sellerInfo: certificateData.sellerInfo,
        // Add the appropriate property info object based on item type
        [getItemInfoFieldName(certificateData.itemType)]:
          certificateData[getItemInfoFieldName(certificateData.itemType)],
        certificateMetadata: nftMetadata,
        createdAt: new Date().toISOString(),
      },
    };

    // Store NFT data in 'nfts' collection
    let insertedId = null;
    try {
      await mongoClient.connect();
      const db = mongoClient.db(dbName);
      const nftsCollection = db.collection(nftsCollectionName);
      // Try to get userId from req.user, certificateData, or fetch from CertificatDemand
      let userId = null;
      if (req.user && req.user._id) {
        userId = req.user._id.toString();
      } else if (certificateData.userId) {
        userId = certificateData.userId.toString();
      } else if (
        certificateData.buyerInfo &&
        certificateData.buyerInfo.userId
      ) {
        userId = certificateData.buyerInfo.userId.toString();
      }
      // Try to fetch userId from CertificatDemand if still not found
      if (!userId && certificateData._id) {
        try {
          const CertificatDemand = require('../models/certificatsDemandModel');
          const demand = await CertificatDemand.findById(certificateData._id);
          if (demand && demand.userId) {
            userId = demand.userId.toString();
            console.log('Fetched userId from CertificatDemand:', userId);
          } else {
            console.warn('CertificatDemand found but userId missing.');
          }
        } catch (fetchErr) {
          console.error(
            'Error fetching CertificatDemand for userId:',
            fetchErr,
          );
        }
      }
      if (!userId) {
        console.warn(
          'No userId found for property NFT. Consider passing userId in the request or ensure CertificatDemand._id is provided.',
        );
      }
      const insertResult = await nftsCollection.insertOne({
        ...responseData.data,
        userId: userId,
        status: 'minted',
        originalRequest: req.body,
        mintedAt: new Date(),
      });
      insertedId = insertResult.insertedId;
      console.log('NFT data stored in nfts collection with _id:', insertedId);
    } catch (mongoErr) {
      console.error('Failed to store NFT data in nfts collection:', mongoErr);
    } finally {
      if (mongoClient) await mongoClient.close();
    }

    // Add certificateId (_id) to the response
    if (insertedId) {
      responseData.data.certificateId = insertedId;
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in createAndMintNFT:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  } finally {
    if (client) client.close();
  }
};

module.exports = {
  createAndMintPropertyNFT,
  getPrivateKeyFromAccountId,
};
