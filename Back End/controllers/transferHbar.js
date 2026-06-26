require('dotenv').config();

const {
  AccountId,
  PrivateKey,
  Client,
  TransferTransaction,
  Hbar,
} = require('@hashgraph/sdk'); // v2.46.0
const Wallet = require('../models/walletModel');

// Admin wallet for platform fees
// This must match the actual accountId of the admin wallet on Hedera
const ADMIN_WALLET_ID = '0.0.6029502'; // Admin wallet for platform fees
const PLATFORM_FEE = 0.0001; // 0.0001 HBAR platform fee

// Import the transaction processor for NFT updates
const {
  processAdminWalletTransaction,
} = require('./adminWalletTransactionProcessor');

/**
 * Transfers HBAR from one account to another
 * @param {object} req - Express request object (requires receiverAccount and amount in body)
 * @param {object} res - Express response object
 * @returns {object} JSON response with transaction details
 */
const transferHbar = async (req, res) => {
  let client;
  try {
    // Validate required parameters
    const { receiverAccount, amount } = req.body;
    // Get the user ID from the authenticated request
    const userId = req.user._id;

    if (!receiverAccount) {
      return res.status(400).json({
        error: 'Missing receiverAccount in request body',
        message: 'Receiver account ID is required',
      });
    }

    const transferAmount = amount ? parseFloat(amount) : 1;

    // Find the sender's wallet using the authenticated user's ID
    const senderWallet = await Wallet.findOne({ userId: userId });

    if (!senderWallet) {
      return res.status(404).json({
        error: 'Wallet not found',
        message: 'No wallet found for this user',
      });
    }

    // Calculate total amount including platform fee
    const totalAmount = transferAmount + PLATFORM_FEE;

    // Check if sender has sufficient balance (including platform fee)
    if (senderWallet.balance < totalAmount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        message: `Your balance (${senderWallet.balance} HBAR) is insufficient for this transfer (${transferAmount} + ${PLATFORM_FEE} platform fee)`,
      });
    }

    // Get sender's account details
    const SENDER_ACCOUNT_ID = AccountId.fromString(senderWallet.accountId);
    const SENDER_PRIVATE_KEY = PrivateKey.fromStringECDSA(
      senderWallet.privateKey,
    );

    // Pre-configured client for test network (testnet)
    client = Client.forTestnet();

    // Set the operator with the account ID and private key
    client.setOperator(SENDER_ACCOUNT_ID, SENDER_PRIVATE_KEY);

    // Convert receiver account to proper format
    const receiverAccountId = AccountId.fromString(receiverAccount);

    // Verify admin wallet ID format
    console.log('🔍 BLOCKCHAIN TRANSACTION DEBUG:');
    console.log(`Admin wallet ID being used: ${ADMIN_WALLET_ID}`);
    try {
      const adminAccountId = AccountId.fromString(ADMIN_WALLET_ID);
      console.log(`✅ Valid AccountId format: ${adminAccountId.toString()}`);
    } catch (err) {
      console.error(
        `❌ CRITICAL ERROR: Invalid admin account ID format: ${err.message}`,
      );
      return res.status(500).json({
        error: 'Admin wallet configuration error',
        message:
          'Platform fee transfer cannot be processed due to admin wallet misconfiguration',
      });
    }

    // Create a transaction to transfer HBAR, including platform fee to admin wallet
    console.log(
      `Creating transaction: ${transferAmount} HBAR to ${receiverAccountId.toString()} and ${PLATFORM_FEE} HBAR to admin ${ADMIN_WALLET_ID}`,
    );

    const txTransfer = new TransferTransaction()
      // Deduct the main amount + platform fee from sender
      .addHbarTransfer(
        SENDER_ACCOUNT_ID,
        new Hbar(-(transferAmount + PLATFORM_FEE)),
      )
      // Send the requested amount to recipient
      .addHbarTransfer(receiverAccountId, new Hbar(transferAmount))
      // Send platform fee to admin wallet
      .addHbarTransfer(
        AccountId.fromString(ADMIN_WALLET_ID),
        new Hbar(PLATFORM_FEE),
      )
      .freezeWith(client);

    console.log('Transaction created successfully');

    // Sign with the sender's private key
    console.log('Signing transaction with sender private key...');
    const signedTx = await txTransfer.sign(SENDER_PRIVATE_KEY);
    console.log('Transaction signed successfully');

    // Submit the transaction to a Hedera network
    console.log('Executing transaction on Hedera network...');
    const txTransferResponse = await signedTx.execute(client);
    console.log(
      `Transaction submitted, ID: ${txTransferResponse.transactionId.toString()}`,
    );

    // Request the receipt of the transaction
    console.log('Waiting for transaction receipt...');
    const receiptTransferTx = await txTransferResponse.getReceipt(client);
    console.log(
      `Transaction receipt received. Status: ${receiptTransferTx.status.toString()}`,
    );

    // Get the transaction consensus status
    const statusTransferTx = receiptTransferTx.status;

    // Get the Transaction ID
    const txIdTransfer = txTransferResponse.transactionId.toString();

    // Log Hashscan link
    const hashscanUrl = `https://hashscan.io/testnet/transaction/${txIdTransfer}`;
    console.log(`✅ Transaction complete! View on Hashscan: ${hashscanUrl}`);
    console.log(
      `💰 Platform fee of ${PLATFORM_FEE} HBAR should now be in admin wallet ${ADMIN_WALLET_ID}`,
    );

    // Create transaction record in database for sender, receiver, and admin
    try {
      // Update sender's wallet with only the main transaction (not platform fee)
      senderWallet.transactions.push(
        // Main transaction to recipient
        {
          type: 'send',
          amount: transferAmount,
          counterpartyId: receiverAccountId.toString(),
          timestamp: new Date(),
          status: 'completed',
          transactionId: txIdTransfer,
        },
        // Platform fee transaction is no longer stored in MongoDB
        // but is still sent on the Hedera network
      );
      // Update balance (deduct transfer amount + platform fee)
      senderWallet.balance -= transferAmount + PLATFORM_FEE;
      senderWallet.updatedAt = new Date();
      await senderWallet.save();

      // Find recipient's wallet
      const recipientWallet = await Wallet.findOne({
        accountId: receiverAccountId.toString(),
      });
      if (recipientWallet) {
        // Add transaction to recipient wallet
        recipientWallet.transactions.push({
          type: 'receive',
          amount: transferAmount,
          counterpartyId: SENDER_ACCOUNT_ID.toString(),
          timestamp: new Date(),
          status: 'completed',
          transactionId: txIdTransfer,
        });
        recipientWallet.balance += transferAmount; // Update recipient balance
        recipientWallet.updatedAt = new Date();
        await recipientWallet.save();
      }

      // Find admin wallet and update with platform fee receipt
      try {
        console.log(
          `🔍 Attempting to find admin wallet, trying both ID ${ADMIN_WALLET_ID} and userId 'admin'`,
        );

        // First, directly query to see if we can find the admin wallet
        const adminWallet = await Wallet.findOne({
          $or: [{ accountId: ADMIN_WALLET_ID }, { userId: 'admin' }],
        });

        if (!adminWallet) {
          console.error(
            '❌ Could not find admin wallet using either accountId or userId="admin"',
          );
          console.error(
            '💡 Please check your database to ensure the admin wallet exists',
          );
          // List all wallets for debugging
          const wallets = await Wallet.find({}).select('userId accountId');
          console.log('Available wallets:', JSON.stringify(wallets, null, 2));
          return; // Exit early
        }

        console.log(
          `✅ Found admin wallet with accountId: ${adminWallet.accountId} and userId: ${adminWallet.userId}`,
        );
        console.log(`Current admin wallet balance: ${adminWallet.balance}`);
        console.log(
          `Current transaction count: ${adminWallet.transactions.length}`,
        );

        // IMPORTANT: We no longer store platform fee transactions in the admin wallet's transactions array
        // The fee is still sent on the blockchain, but we don't track it in MongoDB
        console.log(
          `✅ Platform fee of ${PLATFORM_FEE} HBAR was sent to admin wallet ${adminWallet.accountId}`,
        );

        // Update the balance
        adminWallet.balance += PLATFORM_FEE;
        adminWallet.updatedAt = new Date();

        // Save the updated wallet
        const savedAdminWallet = await adminWallet.save();

        if (savedAdminWallet) {
          console.log(
            `✅ Admin wallet successfully updated with platform fee: ${PLATFORM_FEE} HBAR`,
          );
          console.log(
            `✅ Admin wallet new balance: ${savedAdminWallet.balance} HBAR`,
          );
          console.log(
            `✅ Admin wallet transaction count: ${savedAdminWallet.transactions.length}`,
          );

          // Debug the last two transactions
          const recentTransactions = savedAdminWallet.transactions
            .slice(-2)
            .reverse(); // newest first
          console.log('Recent admin wallet transactions:', recentTransactions);
          // Find the most recent 10 HBAR 'receive' payment
          const paymentTx = recentTransactions.find(
            (tx) => tx.type === 'receive' && tx.amount === 10,
          );

          if (paymentTx) {
            console.log(
              '🔍 Detected 10 HBAR payment to admin wallet - this may be for an NFT certificate',
            );
            try {
              // Process the transaction to update corresponding NFT status
              const processingResult =
                await processAdminWalletTransaction(paymentTx);
              console.log('NFT processing result:', processingResult);
            } catch (processingError) {
              console.error('Error processing NFT payment:', processingError);
              // Don't fail the transaction if NFT processing fails
            }
          } else {
            console.log(
              'No recent 10 HBAR payment found in last two transactions.',
            );
          }
        } else {
          console.error(
            '❌ Failed to save admin wallet after adding platform fee',
          );
        }
      } catch (adminError) {
        console.error(
          'Error updating admin wallet with platform fee:',
          adminError,
        );
        console.error('Error details:', adminError.message);
        // Don't fail the transaction if admin wallet update fails
      }
    } catch (dbError) {
      console.error('Error saving transaction to database:', dbError);
      // Continue with response - don't fail the API call if DB update fails
    }

    // Return JSON response
    res.status(200).json({
      message: 'HBAR transferred successfully',
      from: SENDER_ACCOUNT_ID.toString(),
      to: receiverAccountId.toString(),
      amount: transferAmount,
      status: statusTransferTx.toString(),
      transactionId: txIdTransfer,
      hashscanUrl: `https://hashscan.io/testnet/tx/${txIdTransfer}`,
    });
  } catch (error) {
    console.error('Error transferring HBAR:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to transfer HBAR',
    });
  } finally {
    if (client) client.close();
  }
};

module.exports = { transferHbar };
