const Profile = require('../models/profileModel');
const Wallet = require('../models/walletModel');
const NFT = require('../models/nftModel');

// GET /api/stats/profiles-count
exports.getProfilesCount = async (req, res) => {
  try {
    const count = await Profile.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profiles count' });
  }
};

// GET /api/stats/transactions-count
exports.getTransactionsCount = async (req, res) => {
  try {
    const wallets = await Wallet.find({}, 'transactions');
    const count = wallets.reduce(
      (acc, wallet) =>
        acc + (wallet.transactions ? wallet.transactions.length : 0),
      0,
    );
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions count' });
  }
};

// GET /api/stats/nfts-count
exports.getNFTsCount = async (req, res) => {
  try {
    const count = await NFT.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch NFTs count' });
  }
};
