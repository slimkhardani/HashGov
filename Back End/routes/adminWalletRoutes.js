const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
  manuallyProcessTransaction,
  processLatestPayment,
  adminWalletWebhook,
} = require('../controllers/adminWalletTransactionProcessor');

// Routes that require admin authentication
router.use(requireAuth);

// Route to manually process a specific transaction
router.post('/process-transaction/:transactionId', manuallyProcessTransaction);

// Route to process the latest 10 HBAR payment
router.post('/process-latest-payment', processLatestPayment);

// Webhook endpoint for transaction processing
// Note: In a production environment, you might want to secure this differently
router.post('/webhook', adminWalletWebhook);

module.exports = router;
