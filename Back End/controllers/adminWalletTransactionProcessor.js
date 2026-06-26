const mongoose = require('mongoose');
const Wallet = require('../models/walletModel');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB configuration
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'hedera';
const nftsCollection = 'nfts';

/**
 * Process payments received by the admin wallet and update corresponding NFT statuses
 * This function specifically looks for 10 HBAR payments and updates the status of the
 * most recent NFT request from that user to "minted and payed"
 */
const processAdminWalletTransaction = async (transaction) => {
  try {
    console.log('\n🔄 Processing admin wallet transaction...');

    // Check if this is a "receive" transaction of exactly 10 HBAR
    if (transaction.type !== 'receive' || transaction.amount !== 10) {
      console.log('👋 Not a 10 HBAR payment, skipping processing');
      return { processed: false, reason: 'not_payment' };
    }

    console.log(
      `💰 Found 10 HBAR payment from account: ${transaction.counterpartyId}`,
    );

    // Find the wallet with this account ID to get the user ID
    const senderWallet = await Wallet.findOne({
      accountId: transaction.counterpartyId,
    });

    if (!senderWallet) {
      console.log(
        `❌ No wallet found with accountId: ${transaction.counterpartyId}`,
      );
      return { processed: false, reason: 'wallet_not_found' };
    }

    const userId = senderWallet.userId;
    console.log(`👤 Found sender userId: ${userId}`);

    // Connect to MongoDB directly for more complex queries
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const nftsCollection = db.collection('nfts');

    console.log(
      `🔍 Searching for NFTs with userId: ${userId.toString()} and status: 'minted'`,
    );
    console.log('IMPORTANT: Exact user ID to match:', userId.toString());

    // Debug: Show all NFTs for this user regardless of status
    const allUserNfts = await nftsCollection
      .find({ userId: userId.toString() })
      .toArray();

    console.log(
      `Found ${allUserNfts.length} total NFT documents for this user`,
    );
    if (allUserNfts.length > 0) {
      console.log('Sample NFT document fields:', Object.keys(allUserNfts[0]));
      console.log(
        'Sample NFT statuses:',
        allUserNfts.map((nft) => nft.status),
      );
    }

    // CRITICAL FIX: We need to find EXACTLY ONE NFT to update, regardless of type

    // Get ALL NFTs for this user, we'll filter and sort them in memory
    const userNfts = await nftsCollection
      .find({
        $or: [
          // Academic NFTs where userId is directly on document
          { userId: userId.toString() },
          // Property NFTs where userId is in certificateMetadata
          { 'certificateMetadata.userId': userId.toString() },
        ],
      })
      .toArray();

    console.log(`Found ${userNfts.length} total NFTs for user ${userId}`);

    // Filter to only get NFTs with status "minted" (in any location)
    const mintedNfts = userNfts.filter((nft) => {
      // Check all possible status locations
      return (
        nft.status === 'minted' ||
        nft.status === 'approved' ||
        (nft.certificateMetadata &&
          nft.certificateMetadata.status === 'minted') ||
        (nft.originalRequest && nft.originalRequest.status === 'minted')
      );
    });

    console.log(
      `Found ${mintedNfts.length} NFTs with status 'minted' for user ${userId}`,
    );

    // Log all minted NFTs for debugging
    if (mintedNfts.length > 0) {
      console.log(
        'All minted NFTs:',
        mintedNfts.map((nft) => ({
          id: nft._id.toString(),
          tokenId: nft.tokenId,
          type: nft.categoryType || nft.nftInfo?.type || 'unknown',
          status:
            nft.status ||
            nft.certificateMetadata?.status ||
            nft.originalRequest?.status,
        })),
      );
    }

    // Sort by creation date, newest first
    mintedNfts.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.mintedAt || 0);
      const dateB = new Date(b.createdAt || b.mintedAt || 0);
      return dateB - dateA; // Descending order (newest first)
    });

    // Select only the MOST RECENT one
    const mostRecentNFT = mintedNfts.length > 0 ? mintedNfts[0] : null;

    // Determine the NFT type
    let nftType = '';
    if (mostRecentNFT) {
      if (
        mostRecentNFT.categoryType === 'Academic' ||
        (mostRecentNFT.status === 'minted' &&
          typeof mostRecentNFT.userId === 'string')
      ) {
        nftType = 'academic';
      } else if (
        mostRecentNFT.certificateMetadata ||
        mostRecentNFT.nftInfo?.type === 'property-related'
      ) {
        nftType = 'property';
      }
    }

    console.log(
      'Selected NFT:',
      mostRecentNFT ?
        `ID: ${mostRecentNFT._id.toString()}, Type: ${nftType}`
      : 'None found',
    );

    // This section has been moved up in the code, just before the update logic
    // If no NFT found, return error
    if (!mostRecentNFT) {
      console.log(
        `❌ No NFTs with appropriate status found for user: ${userId}`,
      );

      // If we have NFTs but none with "minted" status, let's log their statuses
      if (allUserNfts.length > 0) {
        console.log(
          'Available NFT statuses:',
          allUserNfts.map((nft) => {
            return {
              id: nft._id,
              tokenId: nft.tokenId,
              status: nft.status,
              academicStatus: nft.academicInfo?.status,
              certificateStatus: nft.certificateMetadata?.status,
              createdAt: nft.createdAt,
            };
          }),
        );
      }

      await mongoClient.close();
      return { processed: false, reason: 'no_nfts_found' };
    }

    console.log(
      `🔍 Found most recent NFT document with ID: ${mostRecentNFT._id} for user ${userId}`,
    );
    console.log(
      `NFT Details: Type: ${nftType}, TokenID: ${mostRecentNFT.tokenId}, SerialNumber: ${mostRecentNFT.serialNumber || 'N/A'}`,
    );

    // Update only the single most recent NFT
    try {
      let updateDoc = {};

      // Handle different NFT structures based on the determined type
      if (nftType === 'academic') {
        updateDoc = {
          $set: {
            status: 'minted and payed',
            paymentDate: new Date(),
            paymentTransactionId: transaction._id,
          },
        };
        console.log('Updating academic NFT with ID:', mostRecentNFT._id);
      } else if (nftType === 'property') {
        updateDoc = {
          $set: {
            'certificateMetadata.status': 'minted and payed',
            paymentDate: new Date(),
            paymentTransactionId: transaction._id,
          },
        };
        console.log('Updating property NFT with ID:', mostRecentNFT._id);
      }

      // CRITICAL: Make sure we're only updating one document by its exact _id
      // Convert _id to ObjectId if it's a string
      const nftId =
        typeof mostRecentNFT._id === 'string' ?
          new ObjectId(mostRecentNFT._id)
        : mostRecentNFT._id;

      const result = await nftsCollection.updateOne({ _id: nftId }, updateDoc);

      console.log(`✅ Updated NFT ${nftId} to 'minted and payed'`);
      console.log(
        `Match count: ${result.matchedCount}, Modified count: ${result.modifiedCount}`,
      );

      // SAFETY CHECK: Verify no other NFTs were updated
      const allUserNftsAfterUpdate = await nftsCollection
        .find({
          $or: [
            { userId: userId.toString() },
            { 'certificateMetadata.userId': userId.toString() },
          ],
        })
        .toArray();

      const updatedNfts = allUserNftsAfterUpdate.filter((nft) => {
        return (
          nft.status === 'minted and payed' ||
          (nft.certificateMetadata &&
            nft.certificateMetadata.status === 'minted and payed')
        );
      });

      console.log(
        `After update: Found ${updatedNfts.length} NFTs with status 'minted and payed'`,
      );
      if (updatedNfts.length > 1) {
        console.log(
          'WARNING: Multiple NFTs were updated! This should not happen!',
          updatedNfts.map((nft) => nft._id.toString()),
        );
      }

      await mongoClient.close();
      return {
        processed: true,
        nftsUpdated: result.modifiedCount,
        nftIds: [nftId.toString()],
        nftType: nftType,
      };
    } catch (updateError) {
      console.error('Error updating NFT status:', updateError);
      await mongoClient.close();
      return {
        processed: false,
        reason: 'update_error',
        error: updateError.message,
      };
    }
  } catch (error) {
    console.error('❌ Error processing admin wallet transaction:', error);
    return { processed: false, reason: 'general_error', error: error.message };
  }
};

/**
 * Helper function to group NFTs by timestamp (within a small tolerance)
 * This handles slight timestamp differences that can occur when creating multiple documents
 */
const groupNftsByTimestamp = (nfts) => {
  const groups = [];
  const processedIds = new Set();

  for (const nft of nfts) {
    if (processedIds.has(nft._id.toString())) continue;

    const group = [nft];
    processedIds.add(nft._id.toString());

    // Find matching NFTs created at similar time
    for (const otherNft of nfts) {
      if (processedIds.has(otherNft._id.toString())) continue;

      // Check if timestamps are within 5 seconds of each other
      const timeDiff = Math.abs(
        new Date(nft.createdAt).getTime() -
          new Date(otherNft.createdAt).getTime(),
      );

      if (timeDiff <= 5000) {
        // 5 seconds tolerance
        group.push(otherNft);
        processedIds.add(otherNft._id.toString());
      }
    }

    groups.push(group);
  }

  return groups;
};

/**
 * Manually trigger processing of a specific transaction
 * This is useful for testing or handling missed transactions
 */
const manuallyProcessTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find the admin wallet
    const adminWallet = await Wallet.findOne({ userId: 'admin' });
    if (!adminWallet) {
      return res.status(404).json({
        success: false,
        message: 'Admin wallet not found',
      });
    }

    // Find the specific transaction
    const transaction = adminWallet.transactions.find(
      (tx) => tx._id.toString() === transactionId,
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found in admin wallet',
      });
    }

    // Process the transaction
    const result = await processAdminWalletTransaction(transaction);

    return res.status(200).json({
      success: true,
      message: 'Transaction processing completed',
      result,
    });
  } catch (error) {
    console.error('Error manually processing transaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process transaction',
      error: error.message,
    });
  }
};

/**
 * Process the most recent 10 HBAR transaction in the admin wallet
 */
const processLatestPayment = async (req, res) => {
  try {
    // Find the admin wallet
    const adminWallet = await Wallet.findOne({ userId: 'admin' });
    if (!adminWallet) {
      return res.status(404).json({
        success: false,
        message: 'Admin wallet not found',
      });
    }

    // Find the most recent 10 HBAR "receive" transaction
    const tenHbarTransactions = adminWallet.transactions
      .filter((tx) => tx.type === 'receive' && tx.amount === 10)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (tenHbarTransactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No 10 HBAR receive transactions found in admin wallet',
      });
    }

    const latestTransaction = tenHbarTransactions[0];

    // Process the transaction
    const result = await processAdminWalletTransaction(latestTransaction);

    return res.status(200).json({
      success: true,
      message: 'Latest payment processing completed',
      transactionId: latestTransaction._id,
      timestamp: latestTransaction.timestamp,
      result,
    });
  } catch (error) {
    console.error('Error processing latest payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process latest payment',
      error: error.message,
    });
  }
};

/**
 * Webhook handler for admin wallet updates
 * This can be called whenever the admin wallet is updated with a new transaction
 */
const adminWalletWebhook = async (req, res) => {
  try {
    const { transaction } = req.body;

    if (!transaction) {
      return res.status(400).json({
        success: false,
        message: 'No transaction data provided',
      });
    }

    // Process the transaction
    const result = await processAdminWalletTransaction(transaction);

    return res.status(200).json({
      success: true,
      message: 'Transaction processed via webhook',
      result,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message,
    });
  }
};

module.exports = {
  processAdminWalletTransaction,
  manuallyProcessTransaction,
  processLatestPayment,
  adminWalletWebhook,
};
