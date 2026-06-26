const express = require('express');
const router = express.Router();

// Import reset password controller functions
const {
  requestPasswordReset,
  verifyResetCode,
  updatePassword,
} = require('../controllers/resetPasswordController');

// Request password reset route - send verification code to email
router.post('/request', requestPasswordReset);

// Verify reset code route
router.post('/verify-code', verifyResetCode);

// Update password route
router.post('/update', updatePassword);

module.exports = router;
