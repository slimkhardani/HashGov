require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using SMTP settings from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email body
 * @param {string} html - HTML email body
 * @returns {Promise} - Resolves with info object on success, rejects on error
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    // Create mail options
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send password reset verification code
 * @param {string} to - Recipient email address
 * @param {string} verificationCode - The 6-digit verification code
 * @returns {Promise} - Resolves with info object on success, rejects on error
 */
const sendPasswordResetCode = async (to, verificationCode) => {
  const subject = 'Password Reset Code - HashGov';

  const text = `
    Hello,

    You have requested to reset your password for your HashGov account.
    Your verification code is: ${verificationCode}

    This code will expire in 2 minutes.

    If you did not request this reset, please ignore this email.

    Best regards,
    The HashGov Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 24px; font-weight: bold; color: #5664d2;">
          <span style="margin-right: 8px;">✱</span>HashGov
        </div>
      </div>
      
      <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #333;">Password Reset Code</h2>
        <p>You have requested to reset your password for your HashGov account.</p>
        
        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #5664d2;">${verificationCode}</span>
        </div>
        
        <p style="color: #e53e3e; font-weight: bold;">This code will expire in 2 minutes.</p>
        
        <p>If you did not request this reset, please ignore this email.</p>
      </div>
      
      <div style="text-align: center; font-size: 12px; color: #777;">
        <p>© ${new Date().getFullYear()} HashGov. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, text, html);
};

module.exports = {
  sendEmail,
  sendPasswordResetCode,
};
