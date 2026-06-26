const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/profiles-count', statsController.getProfilesCount);
router.get('/transactions-count', statsController.getTransactionsCount);
router.get('/nfts-count', statsController.getNFTsCount);

module.exports = router;
