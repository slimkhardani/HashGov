require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Admin tokens will start with this prefix
const ADMIN_TOKEN_PREFIX = 'admin-';

const requireAuth = async (req, res, next) => {
  console.log('🔒 Authorization middleware triggered');
  console.log('📋 Request headers:', JSON.stringify(req.headers));

  // Get token from Authorization header or cookie
  let token = null;
  const { authorization } = req.headers;

  // First try authorization header
  if (authorization) {
    console.log(
      '🔑 Authorization header found:',
      authorization.substring(0, 15) + '...',
    );

    if (authorization.startsWith('Bearer ')) {
      token = authorization.split(' ')[1];
    } else {
      token = authorization; // Direct token without Bearer prefix
    }
  }
  // If no Authorization header, check cookies
  else if (req.headers.cookie) {
    console.log('🍪 Checking cookies for token');
    const cookies = req.headers.cookie.split('; ');
    const tokenCookie = cookies.find((cookie) => cookie.startsWith('token='));

    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
      console.log('🔑 Token found in cookies:', token.substring(0, 15) + '...');
    }
  }

  // If no token found in either place, return error
  if (!token) {
    console.log('❌ No token found in Authorization header or cookies');
    return res.status(401).json({ error: 'Authorization token required' });
  }

  // Check if the token is an admin token
  if (token.startsWith(ADMIN_TOKEN_PREFIX)) {
    console.log('👑 Admin token detected:', token.substring(0, 15) + '...');
    req.isAdmin = true;
    req.adminToken = token;
    return next();
  }

  // Not an admin token, so it should be a JWT
  try {
    console.log('🔍 Attempting to verify JWT token for regular user');
    console.log('JWT secret exists:', process.env.JWT_SECRET ? 'Yes' : 'No');

    // Verify token using JWT
    const { _id } = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hedera-secret-key-for-jwt',
    );

    console.log('✅ Token verification successful for user ID:', _id);

    // Attach user to request object
    const user = await User.findOne({ _id }).select('_id');

    if (!user) {
      console.log('❌ User not found in database with ID:', _id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('👤 User found:', user);
    req.user = user;
    req.isAdmin = false; // explicitly mark as non-admin
    next();
  } catch (error) {
    console.log('🚫 Authentication error:', error.name, error.message);
    if (error.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ error: 'Token expired, please login again' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token signature' });
    }
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = requireAuth;
