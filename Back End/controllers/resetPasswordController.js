const User = require('../models/userModel');
const ResetToken = require('../models/resetTokenModel');
const bcrypt = require('bcryptjs');
const { sendPasswordResetCode } = require('../util/emailService');
const validator = require('validator');

/**
 * Generate a random 6-digit code
 * @returns {string} A 6-digit code
 */
const generateCode = () => {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Request password reset - send verification code to user's email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists in request
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if email is valid format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    // Generate a verification code
    const verificationCode = generateCode();

    // Remove any existing reset tokens for this email
    await ResetToken.deleteMany({ email });

    // Create a new reset token
    const resetToken = new ResetToken({
      email,
      token: verificationCode,
      // The token expiration is handled by the TTL index in the schema
    });
    await resetToken.save();

    // Send the verification code via email
    await sendPasswordResetCode(email, verificationCode);

    // Return success response
    res.status(200).json({
      success: true,
      message:
        'Verification code sent to your email. This code will expire in 2 minutes.',
    });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification code. Please try again later.',
    });
  }
};

/**
 * Verify the reset password code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Check for required fields
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required',
      });
    }

    // Find the reset token for this email
    const resetToken = await ResetToken.findOne({ email, token: code });

    // If no token found or token expired
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code',
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Code verified successfully',
    });
  } catch (error) {
    console.error('Error in verifyResetCode:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying code. Please try again later.',
    });
  }
};

/**
 * Update the user's password after verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Check for required fields
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required',
      });
    }

    // Validate password strength
    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Password not strong enough. It should contain at least 8 characters, including uppercase, lowercase, numbers, and symbols',
      });
    }

    // Find the reset token to verify the code is valid
    const resetToken = await ResetToken.findOne({ email, token: code });

    // If no token found or token expired
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code',
      });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Delete the reset token since it's been used
    await ResetToken.deleteMany({ email });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Error in updatePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password. Please try again later.',
    });
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetCode,
  updatePassword,
};
