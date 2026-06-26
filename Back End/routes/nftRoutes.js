const express = require('express');
const {
  createIdentityAndMintNFT,
} = require('../controllers/identityController');
const { createAndMintNFT } = require('../controllers/SCNFT1');
const {
  createAndMintNFT: createCertifNFT,
} = require('../controllers/SCNFTTEST');
const {
  createAndMintNFT: createPropertyTransaction,
} = require('../controllers/SCNFT2');
const {
  createAndMintNFT: createDualNFTTransaction,
} = require('../controllers/SCNFT3');
const {
  createAndMintNFT: createMongoNFTCertif,
  getPrivateKeyFromAccountId,
} = require('../controllers/Mongo_SCNFT_Certif');
const {
  createAndMintPropertyNFT,
} = require('../controllers/Property Certificat NFT');
const {
  createAndMintNFT: createMongoNFTT,
} = require('../controllers/Mongo_SCNFT_T');
const {
  saveNFTInfo,
  getNFTInfo,
  getAllNFTs,
} = require('../controllers/infoNFT');
const router = express.Router();

// Debug middleware to check token
const debugAuth = (req, res, next) => {
  console.log('=== DEBUG AUTH TOKEN ===');
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Authorization header:', req.headers.authorization);
  console.log('User object in request:', req.user);
  next();
};

// Route to create identity and mint NFT
router.post('/create-and-mint', debugAuth, createIdentityAndMintNFT);

// Route to create, mint, and transfer NFT with category-specific metadata
router.post('/create-and-mint-category', debugAuth, createAndMintNFT);

// Route pour créer et minter un NFT (alias de la route ci-dessus)
router.post('/create', debugAuth, createAndMintNFT);

// Route pour créer et minter un NFT de certificat
router.post('/certif/create', debugAuth, createCertifNFT);

// Route pour créer et minter des NFTs de transactions immobilières/véhicules (acheteur uniquement)
router.post('/property/create', debugAuth, createPropertyTransaction);

// Route pour créer et minter des NFTs de transactions immobilières/véhicules (acheteur ET vendeur)
router.post('/property/create-dual', debugAuth, createDualNFTTransaction);

// Route pour créer et minter des certificats en utilisant les clés de MongoDB
router.post('/certif/create-mongo', debugAuth, createMongoNFTCertif);

// Route pour créer et minter des NFTs de transaction en utilisant les clés de MongoDB
router.post('/transaction/create-mongo', debugAuth, createMongoNFTT);

// Route pour créer et minter des NFTs de certificats de propriété
router.post(
  '/property-certificate/create',
  debugAuth,
  createAndMintPropertyNFT,
);

// Route pour sauvegarder les informations d'un NFT dans MongoDB
router.post('/info', debugAuth, saveNFTInfo);

// Route pour récupérer les informations d'un NFT spécifique
router.get('/info/:id', debugAuth, getNFTInfo);

// Route pour récupérer tous les NFTs
router.get('/info', debugAuth, getAllNFTs);

// Route to get NFT type distribution for dashboard pie chart
router.get('/type-distribution', async (req, res) => {
  try {
    const NFT = require('../models/nftModel');
    const types = ['Certificate', 'realEstate', 'car', 'motorcycle'];
    const agg = await NFT.aggregate([
      { $group: { _id: '$itemType', count: { $sum: 1 } } },
    ]);
    const result = { total: 0 };
    types.forEach((type) => {
      const found = agg.find((a) => a._id === type);
      result[type] = found ? found.count : 0;
      result.total += result[type];
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
