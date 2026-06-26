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
const createAndMintNFT = async (req, res) => {
  let client;
  let mongoClient;
  try {
    // Get request data
    const { metadata } = req.body;
    const categoryType = req.body.categoryType || 'Academic';
    const itemType = req.body.itemType || 'Certificate';
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
    if (!metadata) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: metadata',
      });
    }

    console.log(`Using categoryType: ${categoryType}, itemType: ${itemType}`);

    // Validate the required metadata fields
    if (!metadata.UserAccountId || !metadata.InstitutionAccountId) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required metadata fields: UserAccountId or InstitutionAccountId',
      });
    }

    // Validate category-specific metadata
    if (categoryType === 'Academic' && itemType === 'Certificate') {
      if (
        !metadata.receipentName ||
        !metadata.certificateTitle ||
        !metadata.institutionName ||
        !metadata.dateIssued ||
        !metadata.grade ||
        !metadata.speciality ||
        !metadata.duration ||
        !metadata.issuerName
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Missing required Academic Certificate metadata fields: receipentName, certificateTitle, institutionName, dateIssued, grade, speciality, duration, issuerName',
        });
      }
    } else {
      // Pour d'autres catégories, nous les autorisons mais avec un avertissement
      console.log(
        `AVERTISSEMENT: Catégorie non standard utilisée: ${categoryType} / ${itemType}`,
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
    const metadataStr = generateMetadata(categoryType, itemType, metadata);
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

    // IMPORTANT: Utiliser le compte opérateur pour éviter les problèmes d'autorisation
    // Nous stockons simplement les IDs de l'utilisateur et de l'institution dans les métadonnées
    console.log(`Métadonnées - User Account ID: ${metadata.UserAccountId}`);
    console.log(
      `Métadonnées - Institution Account ID: ${metadata.InstitutionAccountId}`,
    );

    // Récupérer les IDs des comptes depuis les métadonnées
    const userAccountId = AccountId.fromString(metadata.UserAccountId);
    const institutionAccountId = AccountId.fromString(
      metadata.InstitutionAccountId,
    );

    console.log(`User Account ID: ${userAccountId.toString()}`);
    console.log(`Institution Account ID: ${institutionAccountId.toString()}`);

    // Récupérer les clés privées depuis MongoDB
    let userPrivateKey;
    let institutionPrivateKey;

    console.log(
      `Récupération des clés privées depuis MongoDB pour: UserAccountId=${metadata.UserAccountId}`,
    );
    try {
      userPrivateKey = await getPrivateKeyFromAccountId(metadata.UserAccountId);
      console.log(
        `Clé privée récupérée pour l'utilisateur ${metadata.UserAccountId} depuis MongoDB`,
      );
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de la clé pour l'utilisateur depuis MongoDB: ${error.message}`,
      );
      console.log(
        "Utilisation du compte opérateur comme fallback pour l'utilisateur",
      );
      userPrivateKey = MY_PRIVATE_KEY;
    }

    console.log(
      `Récupération des clés privées depuis MongoDB pour: InstitutionAccountId=${metadata.InstitutionAccountId}`,
    );
    try {
      institutionPrivateKey = await getPrivateKeyFromAccountId(
        metadata.InstitutionAccountId,
      );
      console.log(
        `Clé privée récupérée pour l'institution ${metadata.InstitutionAccountId} depuis MongoDB`,
      );
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de la clé pour l'institution depuis MongoDB: ${error.message}`,
      );
      console.log(
        "Utilisation du compte opérateur comme fallback pour l'institution",
      );
      institutionPrivateKey = MY_PRIVATE_KEY;
    }

    // Use the existing tokenIdObj from the NFT minting section
    console.log(`Token ID for association: ${tokenIdObj.toString()}`);

    // Associer le token avec les comptes utilisateur, institution et opérateur
    try {
      // Créer un client pour l'utilisateur
      const userClient = Client.forTestnet();
      userClient.setOperator(userAccountId, userPrivateKey);
      userClient.setMaxQueryPayment(new Hbar(100)); // 100 Hbar

      // Associer le token avec le compte utilisateur
      const associateUserToken = await new TokenAssociateTransaction()
        .setAccountId(userAccountId)
        .setTokenIds([tokenIdObj])
        .setMaxTransactionFee(new Hbar(50)) // Définir les frais max pour cette transaction
        .execute(userClient);
      await associateUserToken.getReceipt(userClient);
      console.log('Token associé avec le compte utilisateur \n');
      userClient.close();

      // Créer un client pour l'institution
      const institutionClient = Client.forTestnet();
      institutionClient.setOperator(
        institutionAccountId,
        institutionPrivateKey,
      );
      institutionClient.setMaxQueryPayment(new Hbar(100)); // 100 Hbar

      // Associer le token avec le compte institution
      const associateInstitutionToken = await new TokenAssociateTransaction()
        .setAccountId(institutionAccountId)
        .setTokenIds([tokenIdObj])
        .setMaxTransactionFee(new Hbar(50)) // Définir les frais max pour cette transaction
        .execute(institutionClient);
      await associateInstitutionToken.getReceipt(institutionClient);
      console.log('Token associé avec le compte institution \n');
      institutionClient.close();

      // L'opérateur s'associe aussi avec le token
      const associateOperatorToken = await new TokenAssociateTransaction()
        .setAccountId(MY_ACCOUNT_ID)
        .setTokenIds([tokenIdObj])
        .setMaxTransactionFee(new Hbar(50)) // Définir les frais max pour cette transaction
        .execute(client);

      const associateReceipt = await associateOperatorToken.getReceipt(client);
      console.log(
        `Token associé avec le compte opérateur avec succès: ${associateReceipt.status} \n`,
      );
    } catch (error) {
      // Vérifier si l'erreur est due à une association déjà existante
      if (error.message.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
        console.log('Le token est déjà associé avec le compte opérateur \n');
      } else {
        console.error("Erreur lors de l'association du token:", error.message);
        // Continuer l'exécution même en cas d'erreur
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
    // Prepare response data
    const responseData = {
      success: true,
      message: 'Certificat NFT créé avec succès',
      data: {
        tokenId: tokenIdObj.toString(),
        nftInfo: {
          serialNumber: serial.toString(),
          currentOwner: OPERATOR_ACCOUNT_ID,
        },
        certificateMetadata: {
          category: 'Certificat',
          certificateTitle: metadata.certificateTitle,
          receipentName: metadata.receipentName,
          institutionName: metadata.institutionName,
          dateIssued: metadata.dateIssued,
          grade: metadata.grade,
          speciality: metadata.speciality,
          duration: metadata.duration,
          issuerName: metadata.issuerName,
        },
        originalAccounts: {
          userAccountId: metadata.UserAccountId,
          institutionAccountId: metadata.InstitutionAccountId,
          note: 'Les comptes utilisateur et institution sont uniquement enregistrés dans les métadonnées. Le NFT est actuellement détenu par le compte opérateur.',
        },
        createdAt: new Date().toISOString(),
      },
    };

    // Store NFT data in 'nfts' collection only if not skipped
    // This check prevents duplicate documents when called from certificateNFTController.js
    let insertedId = null;
    if (!req.body.skipMongoDBStorage) {
      try {
        await mongoClient.connect();
        const db = mongoClient.db(dbName);
        const nftsCollection = db.collection(nftsCollectionName);

        // Create a flattened document structure to avoid nested objects
        const nftDocument = {
          // Core NFT fields
          tokenId: responseData.data.tokenId,
          serialNumber: responseData.data.nftInfo.serialNumber,
          currentOwner: responseData.data.nftInfo.currentOwner,

          // User and institution identification
          userAccountId: req.body.metadata.UserAccountId,
          institutionAccountId: req.body.metadata.InstitutionAccountId,
          userId: req.body.metadata.userId,

          // Certificate details (flattened)
          certificateTitle: req.body.metadata.certificateTitle,
          recipientName: req.body.metadata.receipentName,
          idNumber: req.body.metadata.idNumber,
          institutionName: req.body.metadata.institutionName,
          dateIssued: req.body.metadata.dateIssued,
          grade: req.body.metadata.grade,
          speciality: req.body.metadata.speciality,
          duration: req.body.metadata.duration,
          issuerName: req.body.metadata.issuerName,

          // Classification
          categoryType: req.body.categoryType || 'Academic',
          itemType: req.body.itemType || 'Certificate',

          // Status and timestamps
          status: 'minted',
          createdAt: new Date(),
          mintedAt: new Date(),
        };

        const insertResult = await nftsCollection.insertOne(nftDocument);
        insertedId = insertResult.insertedId;
        console.log('NFT data stored in nfts collection with _id:', insertedId);
      } catch (mongoErr) {
        console.error('Failed to store NFT data in nfts collection:', mongoErr);
      } finally {
        if (mongoClient) await mongoClient.close();
      }
    } else {
      console.log(
        'Skipping MongoDB storage as requested by skipMongoDBStorage flag',
      );
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
  createAndMintNFT,
  getPrivateKeyFromAccountId,
};
