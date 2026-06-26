const express = require('express');
const router = express.Router();
const {
  verifyCertificate,
} = require('../controllers/certificateNFTController');

// Route to verify a certificate by its ObjectID
router.get('/verify/:nftId', verifyCertificate);

module.exports = router;
