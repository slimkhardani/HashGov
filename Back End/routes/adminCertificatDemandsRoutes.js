const express = require('express');
const router = express.Router();
const adminCertificatDemandsController = require('../controllers/adminCertificatDemandsController');
const certificateNFTController = require('../controllers/certificateNFTController');

// GET /api/admin/certificatdemands/property-related
router.get(
  '/property-related',
  adminCertificatDemandsController.getPropertyRelatedDemands,
);

// GET /api/admin/certificatdemands/academic
router.get('/academic', adminCertificatDemandsController.getAcademicDemands);

// PATCH /api/admin/certificatdemands/:id
router.patch('/:id', adminCertificatDemandsController.updateCertificateStatus);

// DELETE /api/admin/certificatdemands/:id
router.delete('/:id', adminCertificatDemandsController.deleteCertificateDemand);

// POST /api/admin/certificatdemands/mint-nft
router.post('/mint-nft', certificateNFTController.mintAcademicCertificateNFT);

module.exports = router;
