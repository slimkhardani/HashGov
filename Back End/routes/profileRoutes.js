const express = require('express');
const {
  saveProfile,
  getProfile,
  getAllProfiles,
  updateProfileByEmail,
} = require('../controllers/profileController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Protect all profile routes with authentication
router.use(requireAuth);

// Re-enabling profile save endpoint to ensure avatars and profile updates are saved correctly
router.post('/save', saveProfile);

// Get profile by userId
router.get('/:userId', getProfile);

// Get all profiles (admin function)
router.get('/', getAllProfiles);

// Update profile by email (for admin approving update requests)
router.patch('/update-by-email/:email', updateProfileByEmail);

module.exports = router;
